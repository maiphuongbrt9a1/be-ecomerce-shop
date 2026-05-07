import { Test, TestingModule } from '@nestjs/testing';
import { VouchersService } from './vouchers.service';
import { PrismaService } from '@/prisma/prisma.service';
import { NotificationService } from '@/notification/notification.service';

jest.mock('@/helpers/types/types', () => ({ OrdersWithFullInformationInclude: {} }));

describe('VouchersService', () => {
  let service: VouchersService;
  let prisma: { vouchers: { findMany: jest.Mock; create: jest.Mock; findFirst: jest.Mock } };

  beforeEach(async () => {
    prisma = { vouchers: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn() } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VouchersService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: { sendNotification: jest.fn() } },
      ],
    }).compile();
    service = module.get<VouchersService>(VouchersService);
  });

  describe('create', () => {
    it('should create a voucher', async () => {
      const dto = { code: 'SALE50', discountType: 'PERCENTAGE', discountValue: 50, maxUsage: 100 };
      prisma.vouchers.create.mockResolvedValue({ id: 1, ...dto });
      const result = await service.create(dto as any);
      expect(result).toMatchObject({ code: 'SALE50' });
    });
  });

  describe('findOne', () => {
    it('should return a voucher when found', async () => {
      prisma.vouchers.findFirst.mockResolvedValue({ id: 1, code: 'SALE50', discountValue: 50 });
      const result = await service.findOne(1);
      expect(result).toMatchObject({ code: 'SALE50' });
    });

    it('should throw when not found', async () => {
      prisma.vouchers.findFirst.mockRejectedValue(new Error('not found'));
      await expect(service.findOne(999)).rejects.toThrow();
    });
  });
});
