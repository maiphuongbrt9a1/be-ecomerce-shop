import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Message, RoomChat, User } from '@prisma/client';
import { RoomService } from './room.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly roomService: RoomService,
  ) {}
  private readonly logger = new Logger(ChatService.name);

  /*
   * check room if not exists create it, and save the message in room.
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

  /*
   * check if user is joined the room before, if yes then save the message in room.
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
}
