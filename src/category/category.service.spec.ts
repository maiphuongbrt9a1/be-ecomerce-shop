import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import { NotFoundException } from '@nestjs/common';

jest.mock('@/helpers/types/types', () => ({
  OrdersWithFullInformationInclude: {},
}));

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: {
    category: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; count: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      category: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: prisma },
        { provide: AwsS3Service, useValue: { buildS3PublicUrl: jest.fn((k) => k) } },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  describe('findAll', () => {
    it('should return array of categories', async () => {
      const mockCategories = [
        { id: 3, name: 'Áo Thun & Polo', description: 'Các loại áo thun' },
        { id: 4, name: 'Áo Sơ Mi', description: 'Sơ mi công sở' },
      ];
      prisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll(1, 10);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Áo Thun & Polo');
    });

    it('should return empty array when no categories', async () => {
      prisma.category.findMany.mockResolvedValue([]);
      const result = await service.findAll(1, 10);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a category when found', async () => {
      prisma.category.findFirst.mockResolvedValue({ id: 3, name: 'Áo Thun & Polo' });
      const result = await service.findOne(3);
      expect(result).toMatchObject({ id: 3, name: 'Áo Thun & Polo' });
    });

    it('should throw when not found', async () => {
      prisma.category.findFirst.mockRejectedValue(new Error('not found'));
      await expect(service.findOne(999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const dto = { name: 'Giày Dép', description: 'Giày thể thao và dép' };
      prisma.category.create.mockResolvedValue({ id: 10, ...dto });

      const result = await service.create(dto as any);
      expect(result).toMatchObject({ name: 'Giày Dép' });
      expect(prisma.category.create).toHaveBeenCalled();
    });
  });
});
