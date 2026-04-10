import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Message, Prisma, RoomChat, User } from '@prisma/client';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import {
  CreateMessageDto,
  CreatePrivateMessageDto,
} from './dto/create-message.dto';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class ChatService {
  /**
   * Creates chat service instance.
   *
   * This constructor performs the following operations:
   * 1. Injects Prisma service for database operations
   * 2. Injects room service for room lifecycle operations
   *
   * @param {PrismaService} prismaService - Prisma database service
   * @param {RoomService} roomService - Room management service
   */
  constructor(
    private readonly prismaService: PrismaService,
    private readonly roomService: RoomService,
  ) {}
  private readonly logger = new Logger(ChatService.name);

  /**
   * Creates and stores a private message between two users.
   *
   * This method performs the following operations:
   * 1. Checks if a private room between sender and receiver exists
   * 2. Creates the private room when it does not exist
   * 3. Persists the private message to the resolved room
   *
   * @param {User} sender - User sending the private message
   * @param {User} receiver - User receiving the private message
   * @param {string} msg - Message content to be saved
   *
   * @returns {Promise<Message>} The created private message record
   *
   * @remarks
   * - Ensures room existence before writing message data
   * - Message is always linked to one private room
   */
  async createPrivateMessage(
    sender: User,
    receiver: User,
    msg: string,
  ): Promise<Message> {
    let room = await this.roomService.checkPrivateRoomExists(sender, receiver);
    if (!room) {
      room = await this.roomService.createPrivateRoom(sender, receiver);
    }

    return this.prismaService.message.create({
      data: {
        content: msg,
        senderId: sender.id,
        roomChatId: room.id,
      },
    });
  }

  /**
   * Creates and stores a message in a public room.
   *
   * This method performs the following operations:
   * 1. Verifies sender membership in the target room
   * 2. Returns null when sender is not a member
   * 3. Persists the message when membership is valid
   *
   * @param {User} sender - User sending the room message
   * @param {RoomChat} room - Target public room
   * @param {string} msg - Message content to be saved
   *
   * @returns {Promise<Message | null>} Created message when valid, otherwise null
   *
   * @remarks
   * - Membership check prevents unauthorized message writes
   * - Includes related room data in created message response
   */
  async createPublicRoomMessage(
    sender: User,
    room: RoomChat,
    msg: string,
  ): Promise<Message | null> {
    const alreadyInRoom = await this.prismaService.userRoomChat.findFirst({
      where: {
        userId: sender.id,
        roomChatId: room.id,
      },
    });

    if (!alreadyInRoom) {
      return null;
    }

    return this.prismaService.message.create({
      data: {
        content: msg,
        senderId: sender.id,
        roomChatId: room.id,
      },
      include: {
        roomChat: true,
      },
    });
  }

  /**
   * Retrieves all chat rooms that a specific user has joined.
   *
   * This method performs the following operations:
   * 1. Fetches private rooms where membership contains the given user id
   * 2. Fetches public rooms where membership contains the given user id
   * 3. Merges both room groups into a single list for chat sidebar/listing
   *
   * @param {number} userId - Authenticated user id used to filter joined rooms
   *
   * @returns {Promise<RoomChat[]>} List of joined rooms (private + public)
   *   Returns empty array when user has not joined any room
   *
   * @throws {BadRequestException} If fetching room data fails
   */
  async getAllRooms(userId: number): Promise<RoomChat[]> {
    try {
      const privateRooms = await this.prismaService.roomChat.findMany({
        where: {
          isPrivate: true,
          members: {
            some: {
              userId: userId,
            },
          },
        },
        include: { members: true },
      });
      const publicRooms = await this.prismaService.roomChat.findMany({
        where: {
          isPrivate: false,
          members: {
            some: {
              userId: userId,
            },
          },
        },
        include: { members: true },
      });

      this.logger.log('Fetched all chat rooms successfully');
      return [...privateRooms, ...publicRooms];
    } catch (error) {
      this.logger.error('Failed to fetch chat rooms: ', error);
      throw new BadRequestException('Failed to fetch chat rooms');
    }
  }

  /**
   * Creates a public room for authenticated user.
   *
   * This method performs the following operations:
   * 1. Validates creator user existence
   * 2. Validates room name uniqueness
   * 3. Creates public room and adds creator as member
   *
   * @param {number} userId - Creator user id
   * @param {CreateRoomDto} payload - Room creation payload
   *
   * @returns {Promise<RoomChat>} Created room
   *
   * @throws {NotFoundException} If creator user does not exist
   * @throws {BadRequestException} If room already exists or operation fails
   */
  async createPublicRoomByUser(
    userId: number,
    payload: CreateRoomDto,
  ): Promise<RoomChat> {
    try {
      const creator = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!creator) {
        throw new NotFoundException('User not found');
      }

      const existing = await this.prismaService.roomChat.findFirst({
        where: { name: payload.name },
      });
      if (existing) {
        throw new BadRequestException('Room exists already with this name');
      }

      return await this.roomService.createPublicRoom(payload, creator);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Failed to create public room: ', error);
      throw new BadRequestException('Failed to create public room');
    }
  }

  /**
   * Joins authenticated user to an existing room.
   *
   * This method performs the following operations:
   * 1. Validates user and room existence
   * 2. Applies room membership constraints
   * 3. Creates membership relation
   *
   * @param {number} userId - User id that joins room
   * @param {JoinRoomDto} payload - Join room payload
   *
   * @returns {Promise<{ joined: boolean; roomName: string }>} Join result object
   *
   * @throws {NotFoundException} If user or room is not found
   * @throws {BadRequestException} If join is not allowed
   */
  async joinPublicRoomByUser(
    userId: number,
    payload: JoinRoomDto,
  ): Promise<{ joined: boolean; roomName: string }> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const room = await this.prismaService.roomChat.findFirst({
        where: { name: payload.name },
      });
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      const joined = await this.roomService.join(room, user);
      if (!joined) {
        throw new BadRequestException('User cannot join this room');
      }

      return {
        joined: true,
        roomName: room.name,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Failed to join room: ', error);
      throw new BadRequestException('Failed to join room');
    }
  }

  /**
   * Sends a message to a public room from authenticated user.
   *
   * This method performs the following operations:
   * 1. Validates sender and room existence
   * 2. Verifies sender membership in room
   * 3. Persists public room message
   *
   * @param {number} userId - Sender user id
   * @param {CreateMessageDto} payload - Public message payload
   *
   * @returns {Promise<Message>} Created message record
   *
   * @throws {NotFoundException} If sender or room is not found
   * @throws {BadRequestException} If sender is not room member or creation fails
   */
  async sendPublicMessageByUser(
    userId: number,
    payload: CreateMessageDto,
  ): Promise<Message> {
    try {
      const sender = await this.prismaService.user.findUnique({
        where: { id: userId },
      });
      if (!sender) {
        throw new NotFoundException('User not found');
      }

      const room = await this.prismaService.roomChat.findFirst({
        where: {
          name: payload.room_name,
          isPrivate: false,
        },
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }

      const createdMessage = await this.createPublicRoomMessage(
        sender,
        room,
        payload.text,
      );

      if (!createdMessage) {
        throw new BadRequestException('User is not a member of this room');
      }

      return createdMessage;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Failed to send public room message: ', error);
      throw new BadRequestException('Failed to send public room message');
    }
  }

  /**
   * Sends a private message from authenticated user to receiver.
   *
   * This method performs the following operations:
   * 1. Validates sender and receiver existence
   * 2. Ensures private room exists (or creates it)
   * 3. Persists private message
   *
   * @param {number} userId - Sender user id
   * @param {CreatePrivateMessageDto} payload - Private message payload
   *
   * @returns {Promise<Message>} Created private message
   *
   * @throws {NotFoundException} If sender or receiver is not found
   * @throws {BadRequestException} If message creation fails
   */
  async sendPrivateMessageByUser(
    userId: number,
    payload: CreatePrivateMessageDto,
  ): Promise<Message> {
    try {
      const sender = await this.prismaService.user.findUnique({
        where: { id: userId },
      });
      if (!sender) {
        throw new NotFoundException('User not found');
      }

      const receiver = await this.prismaService.user.findUnique({
        where: { id: Number(payload.receiver) },
      });
      if (!receiver) {
        throw new NotFoundException('Receiver not found');
      }

      return await this.createPrivateMessage(sender, receiver, payload.text);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Failed to send private message: ', error);
      throw new BadRequestException('Failed to send private message');
    }
  }

  /**
   * Retrieves paginated messages of a room by room name.
   *
   * This method performs the following operations:
   * 1. Validates room existence
   * 2. Applies pagination to room messages
   * 3. Returns messages ordered by creation date desc
   *
   * @param {string} roomName - Room name to query messages
   * @param {number} page - Page number for pagination
   * @param {number} perPage - Number of messages per page
   *
   * @returns {Promise<Message[]>} Paginated room messages
   *
   * @throws {NotFoundException} If room is not found
   * @throws {BadRequestException} If query fails
   */
  async getRoomMessages(
    roomName: string,
    page: number,
    perPage: number,
  ): Promise<Message[]> {
    try {
      const room = await this.prismaService.roomChat.findFirst({
        where: { name: roomName },
      });
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      const paginate = createPaginator({ perPage });
      const result = await paginate<Message, Prisma.MessageFindManyArgs>(
        this.prismaService.message,
        {
          where: { roomChatId: room.id },
          orderBy: { createdAt: 'desc' },
        },
        { page },
      );

      return result.data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error('Failed to fetch room messages: ', error);
      throw new BadRequestException('Failed to fetch room messages');
    }
  }
}
