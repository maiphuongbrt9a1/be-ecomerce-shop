import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    NotificationType: { PERSONAL_NOTIFICATION: 'PERSONAL_NOTIFICATION', SHOP_NOTIFICATION: 'SHOP_NOTIFICATION' },
    Role: { ADMIN: 'ADMIN', OPERATOR: 'OPERATOR', USER: 'USER', STAFF: 'STAFF' },
  };
});

jest.mock('@/helpers/types/types', () => ({
  OrdersWithFullInformationInclude: {},
}));

jest.mock('@/helpers/utils', () => ({
  comparePasswordHelper: jest.fn(),
  hashPasswordHelper: jest.fn(),
  formatMediaField: jest.fn(),
  resolveUrl: jest.fn(),
  createPackageChecksum: jest.fn(),
  verifyPackageChecksum: jest.fn(),
}));

import { NotificationService } from './notification.service';
import { PrismaService } from '@/prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';

describe('NotificationService', () => {
  let service: NotificationService;
  let prismaService: {
    user: { findUnique: jest.Mock };
    notification: {
      create: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
  };
  let notificationGateway: {
    emitPersonalNotificationToUserRoom: jest.Mock;
    emitShopNotificationToAllUsers: jest.Mock;
  };

  beforeEach(async () => {
    prismaService = {
      user: { findUnique: jest.fn() },
      notification: {
        create: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };
    notificationGateway = {
      emitPersonalNotificationToUserRoom: jest.fn(),
      emitShopNotificationToAllUsers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prismaService },
        { provide: NotificationGateway, useValue: notificationGateway },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotificationToUser', () => {
    it('should throw NotFoundException when recipient not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.sendNotificationToUser(999, 'Title', 'Content'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create notification and emit via gateway', async () => {
      const recipient = { id: BigInt(1), email: 'user@test.com' };
      const notification = { id: BigInt(100), title: 'Title', content: 'Content' };
      prismaService.user.findUnique.mockResolvedValue(recipient);
      prismaService.notification.create.mockResolvedValue(notification);
      notificationGateway.emitPersonalNotificationToUserRoom.mockReturnValue(true);

      const result = await service.sendNotificationToUser(1, 'Title', 'Content');

      expect(result).toEqual(notification);
      expect(notificationGateway.emitPersonalNotificationToUserRoom).toHaveBeenCalled();
    });
  });

  describe('sendNotificationToAllUsers', () => {
    it('should throw NotFoundException when sender not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.sendNotificationToAllUsers(999, 'Title', 'Content'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when sender is not ADMIN or OPERATOR', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: BigInt(1),
        email: 'user@test.com',
        role: 'USER',
      });

      await expect(
        service.sendNotificationToAllUsers(1, 'Title', 'Content'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create shop notification when sender is ADMIN', async () => {
      const sender = { id: BigInt(1), email: 'admin@test.com', role: 'ADMIN' };
      const notification = { id: BigInt(200), title: 'Sale', content: 'Big sale' };
      prismaService.user.findUnique.mockResolvedValue(sender);
      prismaService.notification.create.mockResolvedValue(notification);
      notificationGateway.emitShopNotificationToAllUsers.mockReturnValue(true);

      const result = await service.sendNotificationToAllUsers(1, 'Sale', 'Big sale');

      expect(result).toEqual(notification);
      expect(notificationGateway.emitShopNotificationToAllUsers).toHaveBeenCalled();
    });
  });

  describe('getUnreadCountForUser', () => {
    it('should return unread count', async () => {
      prismaService.notification.count.mockResolvedValue(5);

      const result = await service.getUnreadCountForUser(1);

      expect(result).toBe(5);
    });

    it('should throw BadRequestException on failure', async () => {
      prismaService.notification.count.mockRejectedValue(new Error('DB error'));

      await expect(service.getUnreadCountForUser(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updatePersonalNotificationStatus', () => {
    it('should throw NotFoundException when notification not found', async () => {
      prismaService.notification.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePersonalNotificationStatus(999, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for shop notification', async () => {
      prismaService.notification.findUnique.mockResolvedValue({
        id: BigInt(1),
        type: 'SHOP_NOTIFICATION',
        recipientId: BigInt(1),
      });

      await expect(
        service.updatePersonalNotificationStatus(1, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user is not the recipient', async () => {
      prismaService.notification.findUnique.mockResolvedValue({
        id: BigInt(1),
        type: 'PERSONAL_NOTIFICATION',
        recipientId: BigInt(2),
      });

      await expect(
        service.updatePersonalNotificationStatus(1, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should mark notification as read', async () => {
      prismaService.notification.findUnique.mockResolvedValue({
        id: BigInt(1),
        type: 'PERSONAL_NOTIFICATION',
        recipientId: BigInt(1),
      });
      prismaService.notification.update.mockResolvedValue({ id: BigInt(1), isRead: true });

      const result = await service.updatePersonalNotificationStatus(1, 1);

      expect(result.isRead).toBe(true);
    });
  });
});
