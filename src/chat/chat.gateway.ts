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
import { RedisService } from 'nestjs-redis';
import { Server, Socket } from 'socket.io';
import * as socketioJwt from 'socketio-jwt';
import { ChatService } from './chat.service';
import { AuthService } from '@/auth/auth.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';

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
    private chatService: ChatService,
    private authService: AuthService,
  ) {}
  private readonly logger: Logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    (<any>this.server).set(
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

      const userRoomChat = await tx.userRoomChat.create({
        data: {
          userId: client.request.,
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
    const room: RoomEntity = await this.roomRepository.findOne(
      { name: payload.name },
      { relations: ['members'] },
    );
    if (!room) {
      console.log('room not found');
      return;
    }

    let isJoined = await this.roomRepository.join(room, client.request.user);
    if (!isJoined) {
      client.emit('not joined');
    }
    client.join(room.name);

    const answerPayload = {
      name: client.request.user.email,
      text: 'new user joined',
    };

    this.server.to(room.name).emit('userJoined', answerPayload);
  }

  @SubscribeMessage('getRooms')
  async handleGetRooms(@ConnectedSocket() client: Socket, payload) {
    const pvrooms: RoomEntity[] = await this.roomRepository.find({
      where: { isPrivate: true },
      relations: ['members'],
    });
    const pubrooms: RoomEntity[] = await this.roomRepository.find({
      where: { isPrivate: false },
    });
    pvrooms.forEach((value) => {
      if (value.isPrivate) {
        value.name = value.members[0].email;
      }
    });
    // console.log(rooms);
    client.emit('getRooms', [...pvrooms, ...pubrooms]);
  }

  @SubscribeMessage('msgToRoomServer')
  async handleRoomMessage(client: Socket, payload: CreateMessageDto) {
    const room = await this.roomRepository.findOne({
      where: { name: payload.room_name, isPrivate: false },
      relations: ['members'],
    });

    if (!room) {
      this.logger.log('room not found');
      return;
    }
    const createdMessage = await this._chatService.createPublicRoomMessage(
      client.request.user,
      room,
      payload.text,
    );
    const answerPayload = {
      name: client.request.user.email,
      text: payload.text,
    };
    this.server
      .to(createdMessage.room.name)
      .emit('msgToRoomClient', answerPayload);
  }

  @SubscribeMessage('msgPrivateToServer')
  async handlePrivateMessage(client: Socket, payload: CreatePrivateMessageDto) {
    const receiver = await this.userService.findOne({
      id: payload.receiver,
    });
    //
    if (!receiver) {
      console.log('receiver not found');
      return;
    }
    const createdMessage = await this._chatService.createPrivateMessage(
      client.request.user,
      receiver,
      payload.text,
    );

    const answerPayload = {
      name: client.request.user.email,
      text: payload.text,
    };
    const receiverSocketId: string = await this.redisService
      .getClient()
      .get(`users:${payload.receiver}`);

    // join two clients to room
    const receiverSocketObject =
      this.server.clients().sockets[receiverSocketId];
    receiverSocketObject.join(createdMessage.room.name);
    client.join(createdMessage.room.name);

    // if receiver is online
    if (receiverSocketId) {
      this.server
        .to(createdMessage.room.name)
        .emit('msgPrivateToClient', answerPayload);
    }
  }

  afterInit(server: Server) {
    this.logger.log(`Init chat gateway ${JSON.stringify(server)}`);
  }

  async handleDisconnect(client: Socket) {
    await this.redisService.getClient().del(`users:${client.request.user.id}`);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const user = await this.authService.loginSocket(client);

    // set on redis=> key: user.id,  value: socketId
    await UtilsService.setUserIdAndSocketIdOnRedis(
      this.redisService,
      client.request.user.id,
      client.id,
    );
    // join to all user's room, so can get sent messages immediately
    this.roomRepository.initJoin(user, client);

    this.logger.log(`Client connected: ${client.id}`);
  }
}
