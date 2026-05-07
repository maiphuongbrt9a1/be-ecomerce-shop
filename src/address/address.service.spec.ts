import { Test, TestingModule } from '@nestjs/testing';
import { AddressService } from './address.service';
import { PrismaService } from '@/prisma/prisma.service';

jest.mock('@/helpers/types/types', () => ({ OrdersWithFullInformationInclude: {} }));

describe('AddressService', () => {
  let service: AddressService;
  let prisma: { address: { findFirst: jest.Mock; create: jest.Mock; delete: jest.Mock } };

  beforeEach(async () => {
    prisma = { address: { findFirst: jest.fn(), create: jest.fn(), delete: jest.fn() } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddressService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<AddressService>(AddressService);
  });

  describe('findOne', () => {
    it('should return an address when found', async () => {
      prisma.address.findFirst.mockResolvedValue({ id: 1, street: '268 Lý Thường Kiệt', ward: 'Phường 14', district: 'Quận 10' });
      const result = await service.findOne(1);
      expect(result).toMatchObject({ street: '268 Lý Thường Kiệt' });
    });

    it('should throw when not found', async () => {
      prisma.address.findFirst.mockRejectedValue(new Error('not found'));
      await expect(service.findOne(999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create an address', async () => {
      const dto = { street: '1 Đại Cồ Việt', ward: 'Bách Khoa', district: 'Hai Bà Trưng', province: 'Hà Nội' };
      prisma.address.create.mockResolvedValue({ id: 2, ...dto });
      const result = await service.create(dto as any);
      expect(result).toMatchObject({ street: '1 Đại Cồ Việt' });
    });
  });

  describe('remove', () => {
    it('should delete an address', async () => {
      prisma.address.delete.mockResolvedValue({ id: 1 });
      const result = await service.remove(1);
      expect(result).toMatchObject({ id: 1 });
    });
  });
});
