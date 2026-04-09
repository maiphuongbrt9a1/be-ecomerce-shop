import { UserService } from '@/user/user.service';
import { Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import * as socketioJwt from 'socketio-jwt';
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
  ) {}
  private readonly logger: Logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    const serverWithSet = this.server as unknown as {
      set: (key: string, value: unknown) => void;
    };

    serverWithSet.set(
      'authorization',
      socketioJwt.authorize({
        secret: this.configService.get('JWT_SECRET')!,
        handshake: true,
      }),
    );
  }

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
      console.log('room exists already with this name');
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
      console.log('room not found');
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

  @SubscribeMessage('getRooms')
  async handleGetRooms(@ConnectedSocket() client: Socket) {
    const pvrooms: RoomChat[] = await this.prismaService.roomChat.findMany({
      where: { isPrivate: true },
      include: {
        members: true,
      },
    });
    const pubrooms: RoomChat[] = await this.prismaService.roomChat.findMany({
      where: { isPrivate: false },
      include: {
        members: true,
      },
    });

    // console.log(rooms);
    client.emit('getRooms', [...pvrooms, ...pubrooms]);
  }

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

  @SubscribeMessage('msgPrivateToServer')
  async handlePrivateMessage(client: Socket, payload: CreatePrivateMessageDto) {
    const receiver = await this.prismaService.user.findUnique({
      where: {
        id: Number(payload.receiver),
      },
    });

    if (!receiver) {
      console.log('receiver not found');
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
      console.log('receiver is offline');
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

  afterInit() {
    this.logger.log(`Init chat gateway`);
  }

  async handleDisconnect(client: Socket) {
    await this.redisService.getClient().del(`users:${client.request.user.id}`);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket) {
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
  }
}
