import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '@/prisma/prisma.service';
import { RoomService } from './room.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ChatService', () => {
  let service: ChatService;
  let prismaService: {
    message: { create: jest.Mock };
    userRoomChat: { findFirst: jest.Mock };
    roomChat: { findMany: jest.Mock; findFirst: jest.Mock };
    user: { findUnique: jest.Mock };
  };
  let roomService: {
    checkPrivateRoomExists: jest.Mock;
    createPrivateRoom: jest.Mock;
    createPublicRoom: jest.Mock;
    join: jest.Mock;
  };

  beforeEach(async () => {
    prismaService = {
      message: { create: jest.fn() },
      userRoomChat: { findFirst: jest.fn() },
      roomChat: { findMany: jest.fn(), findFirst: jest.fn() },
      user: { findUnique: jest.fn() },
    };
    roomService = {
      checkPrivateRoomExists: jest.fn(),
      createPrivateRoom: jest.fn(),
      createPublicRoom: jest.fn(),
      join: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: prismaService },
        { provide: RoomService, useValue: roomService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPrivateMessage', () => {
    const sender = { id: 1, email: 'sender@test.com' } as any;
    const receiver = { id: 2, email: 'receiver@test.com' } as any;
    const room = { id: 10, name: 'private-1-2' };
    const createdMessage = { id: 100, content: 'Hello', senderId: 1, roomChatId: 10 };

    it('should create message in existing private room', async () => {
      roomService.checkPrivateRoomExists.mockResolvedValue(room);
      prismaService.message.create.mockResolvedValue(createdMessage);

      const result = await service.createPrivateMessage(sender, receiver, 'Hello');

      expect(roomService.checkPrivateRoomExists).toHaveBeenCalledWith(sender, receiver);
      expect(roomService.createPrivateRoom).not.toHaveBeenCalled();
      expect(result).toEqual(createdMessage);
    });

    it('should create room when private room does not exist', async () => {
      roomService.checkPrivateRoomExists.mockResolvedValue(null);
      roomService.createPrivateRoom.mockResolvedValue(room);
      prismaService.message.create.mockResolvedValue(createdMessage);

      await service.createPrivateMessage(sender, receiver, 'Hello');

      expect(roomService.createPrivateRoom).toHaveBeenCalledWith(sender, receiver);
    });
  });

  describe('createPublicRoomMessage', () => {
    const sender = { id: 1 } as any;
    const room = { id: 10 } as any;

    it('should return null when sender is not a member', async () => {
      prismaService.userRoomChat.findFirst.mockResolvedValue(null);

      const result = await service.createPublicRoomMessage(sender, room, 'Hello');

      expect(result).toBeNull();
    });

    it('should create message when sender is a member', async () => {
      prismaService.userRoomChat.findFirst.mockResolvedValue({ userId: 1, roomChatId: 10 });
      prismaService.message.create.mockResolvedValue({ id: 1, content: 'Hello' });

      const result = await service.createPublicRoomMessage(sender, room, 'Hello');

      expect(result).toEqual({ id: 1, content: 'Hello' });
    });
  });

  describe('getAdminRooms', () => {
    it('should return support rooms', async () => {
      const rooms = [{ id: 1, name: 'support-user1' }];
      prismaService.roomChat.findMany.mockResolvedValue(rooms);

      const result = await service.getAdminRooms();

      expect(result).toEqual(rooms);
      expect(prismaService.roomChat.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { startsWith: 'support-' } },
        }),
      );
    });

    it('should throw BadRequestException on failure', async () => {
      prismaService.roomChat.findMany.mockRejectedValue(new Error('DB error'));

      await expect(service.getAdminRooms()).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendPrivateMessageByUser', () => {
    it('should throw NotFoundException when sender not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.sendPrivateMessageByUser(1, { receiver: 2, text: 'Hi' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when receiver not found', async () => {
      prismaService.user.findUnique
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce(null);

      await expect(
        service.sendPrivateMessageByUser(1, { receiver: 2, text: 'Hi' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPublicRoomByUser', () => {
    it('should throw NotFoundException when creator not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createPublicRoomByUser(1, { name: 'test-room' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when room name already exists', async () => {
      prismaService.user.findUnique.mockResolvedValue({ id: 1 });
      prismaService.roomChat.findFirst.mockResolvedValue({ id: 1, name: 'test-room' });

      await expect(
        service.createPublicRoomByUser(1, { name: 'test-room' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
