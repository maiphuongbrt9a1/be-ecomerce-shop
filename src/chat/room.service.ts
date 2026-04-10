import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { RoomChat, User } from '@prisma/client';
import { Socket } from 'socket.io';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  /**
   * Creates room service instance.
   *
   * This constructor performs the following operations:
   * 1. Injects Prisma service for room and membership persistence
   *
   * @param {PrismaService} prismaService - Prisma database service
   */
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Joins a connected user socket to all existing member rooms.
   *
   * This method performs the following operations:
   * 1. Queries all room memberships for the user
   * 2. Builds room name list from membership records
   * 3. Joins socket to each room in one call
   *
   * @param {User} user - Authenticated user
   * @param {Socket} client - User socket client
   *
   * @remarks
   * - Used during socket connection bootstrap
   * - Ensures user can receive room events immediately
   */
  async initJoin(user: User, client: Socket) {
    // join connected user to all the rooms that is member of.

    const roomsToJoin: string[] = [];
    const rooms = await this.prismaService.userRoomChat.findMany({
      where: {
        userId: user.id,
      },
      include: {
        roomChat: true,
      },
    });

    rooms.forEach((room) => {
      return roomsToJoin.push(room.roomChat.name);
    });

    await client.join(roomsToJoin);
  }

  /**
   * Adds a user to a room when business constraints are satisfied.
   *
   * This method performs the following operations:
   * 1. Loads room details and existing members
   * 2. Validates room existence
   * 3. Prevents private rooms from exceeding two members
   * 4. Creates membership record for the user
   *
   * @param {RoomChat} room - Target room to join
   * @param {User} user - User to add into room
   *
   * @returns {Promise<boolean>} True when join succeeds, otherwise false
   *
   * @remarks
   * - Private rooms are capped at two participants
   * - Logs success and rejection scenarios for debugging
   */
  async join(room: RoomChat, user: User): Promise<boolean> {
    const roomChat = await this.prismaService.roomChat.findFirst({
      where: {
        id: room.id,
      },
      include: {
        members: true,
      },
    });

    if (!roomChat) {
      this.logger.error(`Room with id ${room.id} not found.`);
      return false;
    }

    if (roomChat.isPrivate && roomChat.members.length >= 2) {
      this.logger.error(
        `Room with id ${room.id} is private and already has 2 members.`,
      );
      return false;
    }

    this.logger.log(
      `User with id ${user.id} is joining room with id ${room.id}.`,
    );
    await this.prismaService.userRoomChat.create({
      data: {
        userId: user.id,
        roomChatId: room.id,
      },
    });
    this.logger.log(
      `User with id ${user.id} has joined room with id ${room.id}.`,
    );

    return true;
  }

  /**
   * Creates a new public room and attaches the creator as a member.
   *
   * This method performs the following operations:
   * 1. Starts a Prisma transaction
   * 2. Creates room metadata as public room
   * 3. Creates creator membership in the same transaction
   *
   * @param {CreateRoomDto} data - Public room creation payload
   * @param {User} sender - User creating the room
   *
   * @returns {Promise<RoomChat>} The created public room
   *
   * @remarks
   * - Transaction keeps room and membership creation consistent
   */
  async createPublicRoom(data: CreateRoomDto, sender: User): Promise<RoomChat> {
    const room = await this.prismaService.$transaction(async (tx) => {
      this.logger.log(
        `Creating public room with name ${data.name} by user with id ${sender.id}.`,
      );
      const room = await tx.roomChat.create({
        data: {
          name: data.name,
          description: data.description,
          isPrivate: false,
        },
      });
      this.logger.log(
        `Public room with name ${data.name} created by user with id ${sender.id}.`,
      );
      this.logger.log(
        `Adding user with id ${sender.id} to room with id ${room.id}.`,
      );

      await tx.userRoomChat.create({
        data: {
          userId: sender.id,
          roomChatId: room.id,
        },
      });

      this.logger.log(
        `User with id ${sender.id} has been added to room with id ${room.id}.`,
      );

      return room;
    });

    return room;
  }

  /**
   * Creates a private room between two users.
   *
   * This method performs the following operations:
   * 1. Generates deterministic private room name
   * 2. Creates private room record
   * 3. Adds both users as room members
   *
   * @param {User} sender - First participant
   * @param {User} receiver - Second participant
   *
   * @returns {Promise<RoomChat>} The created private room
   *
   * @remarks
   * - Room name is generated by stable email ordering
   */
  async createPrivateRoom(sender: User, receiver: User): Promise<RoomChat> {
    this.logger.log(
      `Creating private room between user with id ${sender.id} and user with id ${receiver.id}.`,
    );
    const room = await this.prismaService.roomChat.create({
      data: {
        name: this.generatePrivateRoomName(sender, receiver),
        isPrivate: true,
        description: `Private room between ${sender.firstName + ' ' + sender.lastName} and ${receiver.firstName + ' ' + receiver.lastName}`,
        members: {
          createMany: {
            data: [
              {
                userId: sender.id,
              },
              {
                userId: receiver.id,
              },
            ],
          },
        },
      },
    });
    this.logger.log(
      `Private room between user with id ${sender.id} and user with id ${receiver.id} created with id ${room.id}.`,
    );
    return room;
  }

  /**
   * Checks whether a private room already exists for two users.
   *
   * This method performs the following operations:
   * 1. Generates deterministic private room name
   * 2. Queries room by generated name
   *
   * @param {User} sender - First participant
   * @param {User} receiver - Second participant
   *
   * @returns {Promise<RoomChat | null>} Existing room if found, otherwise null
   */
  async checkPrivateRoomExists(
    sender: User,
    receiver: User,
  ): Promise<RoomChat | null> {
    return await this.prismaService.roomChat.findFirst({
      where: {
        name: this.generatePrivateRoomName(sender, receiver),
      },
    });
  }

  /**
   * Generates deterministic private room name from two user emails.
   *
   * This method performs the following operations:
   * 1. Compares both emails lexicographically
   * 2. Returns the same room name regardless of sender/receiver order
   *
   * @param {User} sender - First participant
   * @param {User} receiver - Second participant
   *
   * @returns {string} Deterministic private room name
   *
   * @remarks
   * - Deterministic naming avoids duplicate private rooms for same pair
   */
  generatePrivateRoomName(sender: User, receiver: User): string {
    if (sender.email.localeCompare(receiver.email) === -1) {
      // firstUsername is "<" (before) secondUsername
      return sender.email + '-' + receiver.email;
    } else if (sender.email.localeCompare(receiver.email) === 1) {
      // firstUsername is ">" (after) secondUsername
      return receiver.email + '-' + sender.email;
    } else {
      return 'falsesss';
      // ids are equal, should throw an error
    }
  }
}
