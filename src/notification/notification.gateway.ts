import { AuthService } from '@/auth/auth.service';
import { RedisService } from '@/helpers/redis.service';
import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from '@/user/user.service';
import { Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UtilsService } from '@/helpers/utils.service';
import { CreateShopNotificationDto } from './dto/create-shop-notification.dto';
import { CreatePersonalNotificationDto } from './dto/create-personal-notification.dto';
import { NotificationType, Role } from '@prisma/client';

@WebSocketGateway(81, { cors: { origin: '*' } })
export class NotificationGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit
{
  /**
   * Creates notification gateway instance.
   *
   * This constructor performs the following operations:
   * 1. Injects infrastructure services used for auth, DB, and Redis presence tracking
   * 2. Prepares dependencies for realtime notification flows
   *
   * @param {ConfigService} configService - Application config service
   * @param {UserService} userService - User domain service
   * @param {PrismaService} prismaService - Prisma database service
   * @param {RedisService} redisService - Redis helper service for socket mapping
   * @param {AuthService} authService - Authentication service
   * @param {JwtService} jwtService - JWT verification service
   */
  constructor(
    public readonly configService: ConfigService,
    public readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  private readonly logger: Logger = new Logger(NotificationGateway.name);
  private readonly namespace = 'notification';

  // global room for shop notifications,
  private readonly shopNotificationRoom = 'shop_notification_room';

  // private room prefix for user-specific notifications
  // full room name format: user_notification_room_{userId}
  private readonly userNotificationRoomPrefix = 'user_notification_room_';

  @WebSocketServer()
  server: Server;

  /**
   * Emits a personal notification payload to a specific user room.
   *
   * @param {number} recipientId - Recipient user id
   * @param {object} payload - Notification payload sent to client
   */
  emitPersonalNotificationToUserRoom(
    recipientId: number,
    payload: {
      receiverId: number;
      receiverEmail: string;
      title: string;
      content: string;
    },
  ): boolean {
    const userRoomName = `${this.userNotificationRoomPrefix}${recipientId}`;
    return this.server
      .to(userRoomName)
      .emit('personalNotificationToClient', payload);
  }

  emitShopNotificationToAllUsers(payload: {
    creatorId: number;
    creatorEmail: string;
    title: string;
    content: string;
  }): boolean {
    return this.server
      .to(this.shopNotificationRoom)
      .emit('shopNotificationToClient', payload);
  }

  /**
   * Lifecycle hook kept for interface compatibility.
   *
   * Middleware registration is performed in afterInit where Socket.IO server
   * instance is guaranteed to be available.
   */
  onModuleInit() {}

  /**
   * Registers JWT authentication middleware after Socket.IO server initialization.
   *
   * This method performs the following operations:
   * 1. Extracts JWT from handshake auth token or Authorization header
   * 2. Verifies token signature and payload
   * 3. Stores decoded payload on socket request for downstream handlers
   *
   * @param {Server} server - Initialized Socket.IO server instance
   */
  afterInit(server: Server) {
    server.use((socket, next) => {
      // Extract token from handshake
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(
          new Error(
            `${this.namespace} Authentication error: No token provided`,
          ),
        );
      }

      try {
        // Verify and decode JWT token
        const decoded = this.jwtService.verify(token);
        socket.request.decoded_token = decoded;
        next();
      } catch (error) {
        return next(
          new Error(
            `${this.namespace} Authentication error: Invalid token ${error}`,
          ),
        );
      }
    });

    this.logger.log(`${this.namespace} Init notification gateway`);
  }

  /**
   * Handles event to send a shop announcement to all connected users.
   *
   * This method performs the following operations:
   * 1. Validates sender role (ADMIN or OPERATOR)
   * 2. Persists announcement into shopNotification table
   * 3. Broadcasts realtime announcement to global notification room
   *
   * @param {Socket} client - Socket client sending the announcement
   * @param {CreateShopNotificationDto} payload - Shop announcement payload
   *
   * @returns {Promise<void>} Completes when announcement flow is handled
   */
  @SubscribeMessage('sendShopNotificationToAllUsers')
  async handleSendShopNotificationToAllUsers(
    client: Socket,
    payload: CreateShopNotificationDto,
  ): Promise<void> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          id: BigInt(client.request.user.id),
        },
      });

      if (!user) {
        this.logger.error(
          `${this.namespace} User with id ${client.request.user.id} not found`,
        );
        return;
      }

      if (user.role !== Role.ADMIN && user.role !== Role.OPERATOR) {
        this.logger.error(
          `${this.namespace} User with id ${client.request.user.id} does not have permission to send shop notifications`,
        );
        return;
      }

      await this.prismaService.notification.create({
        data: {
          title: payload.title,
          content: payload.content,
          creatorId: client.request.user.id,
          type: NotificationType.SHOP_NOTIFICATION,
        },
      });

      const answerPayload = {
        creatorId: Number(client.request.user.id),
        creatorEmail: client.request.user.email,
        title: payload.title,
        content: payload.content,
      };

      this.emitShopNotificationToAllUsers(answerPayload);
    } catch (error) {
      this.logger.error(
        `${this.namespace} Failed to send notification to all users: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  /**
   * Handles event to send a personal notification to a specific user.
   *
   * This method performs the following operations:
   * 1. Validates recipient user exists
   * 2. Persists notification in personalNotification table
   * 3. Emits realtime notification to recipient room
   *
   * @param {Socket} client - Socket client triggering personal notification
   * @param {CreatePersonalNotificationDto} payload - Personal notification payload
   *
   * @returns {Promise<void>} Completes when personal notification flow is handled
   */
  @SubscribeMessage('sendPersonalNotificationToUser')
  async handleSendPersonalNotificationToUser(
    client: Socket,
    payload: CreatePersonalNotificationDto,
  ): Promise<void> {
    const receiver = await this.prismaService.user.findUnique({
      where: {
        id: BigInt(payload.recipientId),
      },
    });

    if (!receiver) {
      this.logger.log(
        `${this.namespace} Receiver with id ${payload.recipientId} not found`,
      );
      return;
    }

    await this.prismaService.notification.create({
      data: {
        title: payload.title,
        content: payload.content,
        recipientId: BigInt(payload.recipientId),
        creatorId: BigInt(client.request.user.id),
        type: NotificationType.PERSONAL_NOTIFICATION,
      },
    });

    const answerPayload = {
      receiverId: payload.recipientId,
      receiverEmail: receiver.email,
      title: payload.title,
      content: payload.content,
    };

    this.emitPersonalNotificationToUserRoom(payload.recipientId, answerPayload);
  }

  /**
   * Handles client socket disconnection.
   *
   * This method performs the following operations:
   * 1. Removes user-to-socket mapping from Redis
   * 2. Logs disconnected socket id
   *
   * @param {Socket} client - Socket client that disconnected
   *
   * @returns {Promise<void>} Completes when cleanup is finished
   */
  async handleDisconnect(client: Socket): Promise<void> {
    await this.redisService
      .getClient()
      .del(`${this.namespace}:users:${client.request.user.id}`);
    this.logger.log(`${this.namespace} Client disconnected: ${client.id}`);
  }

  /**
   * Handles new client socket connection.
   *
   * This method performs the following operations:
   * 1. Authenticates socket and resolves current user
   * 2. Stores user-to-socket mapping in Redis
   * 3. Joins user to global announcement room
   * 4. Joins user to private notification room for direct delivery
   * 5. Logs connected socket id
   *
   * @param {Socket} client - Newly connected socket client
   *
   * @returns {Promise<void>} Completes when connection setup is finished
   */
  async handleConnection(client: Socket): Promise<void> {
    try {
      const user = await this.authService.loginSocket(client);

      // set on redis=> key: user.id,  value: socketId
      await UtilsService.setUserIdAndSocketIdOnRedis(
        this.redisService,
        this.namespace,
        user.id.toString(),
        client.id,
      );

      // join to global shop notification room
      await client.join(this.shopNotificationRoom);

      // join to user-specific notification room
      const userRoomName = `${this.userNotificationRoomPrefix}${user.id}`;
      await client.join(userRoomName);

      this.logger.log(`${this.namespace} Client connected: ${client.id}`);
    } catch (error) {
      this.logger.error(
        `${this.namespace} Connection rejected for socket ${client.id}: ${error instanceof Error ? error.message : error}`,
      );
      client.disconnect();
    }
  }
}
