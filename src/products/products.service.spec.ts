import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

jest.mock('@/helpers/utils', () => ({
  formatMediaField: jest.fn((arr) => arr),
  formatMediaFieldWithLogging: jest.fn((arr) => arr),
}));

jest.mock('@/helpers/types/types', () => ({
  OrdersWithFullInformationInclude: {},
}));

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: {
    products: { findFirst: jest.Mock; findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      products: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AwsS3Service, useValue: { buildPublicMediaUrl: jest.fn((k) => `https://s3.com/${k}`) } },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findOne', () => {
    it('should return a product when found', async () => {
      const mockProduct = {
        id: 82,
        name: 'Coolmate Áo Thun Cotton Compact',
        price: 199000,
        stock: 100,
        media: [{ url: 'photo.jpg' }],
        productVariants: [{ id: 1, media: [{ url: 'variant.jpg' }] }],
      };
      prisma.products.findFirst.mockResolvedValue(mockProduct);

      const result = await service.findOne(82);
      expect(result).toMatchObject({ id: 82, name: 'Coolmate Áo Thun Cotton Compact' });
    });

    it('should throw when product not found', async () => {
      prisma.products.findFirst.mockResolvedValue(null);
      await expect(service.findOne(999999)).rejects.toThrow();
    });
  });
});
