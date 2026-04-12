import { UserService } from '@/user/user.service';
import { Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { AuthService } from '@/auth/auth.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UtilsService } from '@/helpers/utils.service';
import { RoomService } from './room.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { RoomChat } from '@prisma/client';
import {
  CreateMessageDto,
  CreatePrivateMessageDto,
} from './dto/create-message.dto';
import { RedisService } from '@/helpers/redis.service';

@WebSocketGateway(80, { cors: { origin: '*' } })
export class ChatGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit
{
  constructor(
    public readonly configService: ConfigService,
    public readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly roomService: RoomService,
    private chatService: ChatService,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}
  private readonly logger: Logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  /**
   * Registers JWT authentication middleware after the WebSocket server is ready.
   *
   * Moved from onModuleInit to afterInit so that this.server is fully
   * initialized before middleware is registered. In NestJS v11, onModuleInit
   * runs before the Socket.IO server is ready, so server.use() had no effect.
   *
   * @param {Server} server - The initialized Socket.IO server instance
   */
  onModuleInit() {}

  afterInit(server: Server) {
    server.use((socket, next) => {
      // Extract token from handshake
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        // Verify and decode JWT token
        const decoded = this.jwtService.verify(token);
        socket.request.decoded_token = decoded;
        next();
      } catch (error) {
        return next(new Error(`Authentication error: Invalid token ${error}`));
      }
    });

    this.logger.log(`Init chat gateway`);
  }

  /**
   * Handles event to create a new public chat room.
   *
   * This method performs the following operations:
   * 1. Validates room name uniqueness
   * 2. Creates room and creator membership in a transaction
   * 3. Joins creator socket to the new room
   * 4. Broadcasts room creation event to room members
   *
   * @param {Socket} client - Socket client creating the room
   * @param {CreateRoomDto} payload - Public room creation payload
   *
   * @returns {Promise<{ name: string; text: string } | void>} Result payload or void when room exists
   */

  @SubscribeMessage('createNewPublicRoom')
  async handleCreatePublicRoom(
    client: Socket,
    payload: CreateRoomDto,
  ): Promise<{ name: string; text: string } | void> {
    const exists = await this.prismaService.roomChat.findFirst({
      where: {
        name: payload.name,
      },
    });

    if (exists) {
      this.logger.log('room exists already with this name');
      return;
    }

    const room = await this.prismaService.$transaction(async (tx) => {
      const room = await tx.roomChat.create({
        data: {
          name: payload.name,
          description: payload.description,
          isPrivate: false,
        },
      });

      await tx.userRoomChat.create({
        data: {
          userId: client.request.user.id,
          roomChatId: room.id,
        },
      });

      return room;
    });

    await client.join(room.name);

    const answerPayload = { name: room.name, text: 'new room created' };

    this.server.to(room.name).emit('createdNewPublicRoom', answerPayload);
  }

  /**
   * Handles event to join a public room.
   *
   * This method performs the following operations:
   * 1. Finds room by name
   * 2. Validates join constraints via room service
   * 3. Joins client socket to room channel
   * 4. Broadcasts user joined event to room members
   *
   * @param {Socket} client - Socket client joining the room
   * @param {JoinRoomDto} payload - Join room payload
   *
   * @returns {Promise<void>} Completes when join flow is handled
   */
  @SubscribeMessage('joinPublicRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomDto,
  ) {
    const room: RoomChat | null = await this.prismaService.roomChat.findFirst({
      where: {
        name: payload.name,
      },
      include: {
        members: true,
      },
    });

    if (!room) {
      this.logger.log('room not found');
      return;
    }

    const isJoined = await this.roomService.join(room, client.request.user);

    if (!isJoined) {
      client.emit('not joined');
    }
    await client.join(room.name);

    const answerPayload = {
      name: client.request.user.email,
      text: 'new user joined',
    };

    this.server.to(room.name).emit('userJoined', answerPayload);
  }

  /**
   * Handles event to fetch all rooms joined by current user.
   *
   * This method performs the following operations:
   * 1. Fetches private rooms where current user is a member
   * 2. Fetches public rooms where current user is a member
   * 3. Merges both room sets and emits result to requester
   *
   * @param {Socket} client - Authenticated socket client requesting joined rooms
   *
   * @returns {Promise<void>} Completes when joined room list is emitted
   */
  @SubscribeMessage('getRooms')
  async handleGetRooms(@ConnectedSocket() client: Socket) {
    const pvrooms: RoomChat[] = await this.prismaService.roomChat.findMany({
      where: {
        isPrivate: true,
        members: { some: { userId: client.request.user.id } },
      },
      include: {
        members: true,
      },
    });
    const pubrooms: RoomChat[] = await this.prismaService.roomChat.findMany({
      where: {
        isPrivate: false,
        members: { some: { userId: client.request.user.id } },
      },
      include: {
        members: true,
      },
    });

    client.emit('getRooms', [...pvrooms, ...pubrooms]);
  }

  /**
   * Handles event to send message to a public room.
   *
   * This method performs the following operations:
   * 1. Resolves target public room by name
   * 2. Persists message via chat service
   * 3. Broadcasts message event to room sockets
   *
   * @param {Socket} client - Socket client sending message
   * @param {CreateMessageDto} payload - Public room message payload
   *
   * @returns {Promise<void>} Completes when message flow is handled
   */
  @SubscribeMessage('msgToRoomServer')
  async handleRoomMessage(client: Socket, payload: CreateMessageDto) {
    const room = await this.prismaService.roomChat.findFirst({
      where: {
        name: payload.room_name,
        isPrivate: false,
      },
      include: {
        members: true,
      },
    });

    if (!room) {
      this.logger.log('room not found');
      return;
    }

    const createdMessage = await this.chatService.createPublicRoomMessage(
      client.request.user,
      room,
      payload.text,
    );

    if (!createdMessage) {
      this.logger.error('message not created');
      return;
    }

    const answerPayload = {
      name: client.request.user.email,
      text: payload.text,
    };
    this.server.to(room.name).emit('msgToRoomClient', answerPayload);
  }

  /**
   * Handles event to send private message to a specific user.
   *
   * This method performs the following operations:
   * 1. Resolves receiver user by id
   * 2. Persists private message via chat service
   * 3. Resolves deterministic private room name
   * 4. Finds receiver socket id from Redis
   * 5. Joins sender and receiver sockets to private room
   * 6. Emits private message event when receiver is online
   *
   * @param {Socket} client - Socket client sending private message
   * @param {CreatePrivateMessageDto} payload - Private message payload
   *
   * @returns {Promise<void>} Completes when private message flow is handled
   */
  @SubscribeMessage('msgPrivateToServer')
  async handlePrivateMessage(client: Socket, payload: CreatePrivateMessageDto) {
    const receiver = await this.prismaService.user.findUnique({
      where: {
        id: Number(payload.receiver),
      },
    });

    if (!receiver) {
      this.logger.log(`Receiver with id ${payload.receiver} not found`);
      return;
    }

    await this.chatService.createPrivateMessage(
      client.request.user,
      receiver,
      payload.text,
    );

    const roomName = this.roomService.generatePrivateRoomName(
      client.request.user,
      receiver,
    );

    const answerPayload = {
      name: client.request.user.email,
      text: payload.text,
    };

    const receiverSocketId: string | null = await this.redisService
      .getClient()
      .get(`users:${payload.receiver}`);

    if (!receiverSocketId) {
      this.logger.log(
        `Receiver with id ${payload.receiver} is offline, cannot deliver private message in real-time`,
      );
      return;
    }

    // join two clients to room
    const receiverSocketObject =
      this.server.sockets.sockets.get(receiverSocketId);

    if (!receiverSocketObject) {
      return;
    }

    await receiverSocketObject.join(roomName);

    await client.join(roomName);

    // if receiver is online
    if (receiverSocketId) {
      this.server.to(roomName).emit('msgPrivateToClient', answerPayload);
    }
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
  async handleDisconnect(client: Socket) {
    await this.redisService.getClient().del(`users:${client.request.user.id}`);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Handles new client socket connection.
   *
   * This method performs the following operations:
   * 1. Authenticates socket and resolves current user
   * 2. Stores user-to-socket mapping in Redis
   * 3. Joins user to all existing rooms
   * 4. Logs connected socket id
   *
   * @param {Socket} client - Newly connected socket client
   *
   * @returns {Promise<void>} Completes when connection setup is finished
   */
  async handleConnection(client: Socket) {
    try {
      const user = await this.authService.loginSocket(client);

      // set on redis=> key: user.id,  value: socketId
      await UtilsService.setUserIdAndSocketIdOnRedis(
        this.redisService,
        user.id.toString(),
        client.id,
      );
      // join to all user's room, so can get sent messages immediately
      await this.roomService.initJoin(user, client);

      this.logger.log(`Client connected: ${client.id}`);
    } catch (error) {
      this.logger.error(
        `Connection rejected for socket ${client.id}: ${error instanceof Error ? error.message : error}`,
      );
      client.disconnect();
    }
  }
}
