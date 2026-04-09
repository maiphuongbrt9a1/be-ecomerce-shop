import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { RoomChat, User } from '@prisma/client';
import { Socket } from 'socket.io';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);
  constructor(private readonly prismaService: PrismaService) {}

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
