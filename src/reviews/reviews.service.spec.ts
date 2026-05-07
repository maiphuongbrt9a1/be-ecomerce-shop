import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

jest.mock('@/helpers/utils', () => ({ formatMediaField: jest.fn((arr) => arr), formatMediaFieldWithLogging: jest.fn((arr) => arr) }));
jest.mock('@/helpers/types/types', () => ({ OrdersWithFullInformationInclude: {} }));

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: { reviews: { findMany: jest.Mock; findFirst: jest.Mock; delete: jest.Mock } };

  beforeEach(async () => {
    prisma = { reviews: { findMany: jest.fn(), findFirst: jest.fn(), delete: jest.fn() } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AwsS3Service, useValue: { buildPublicMediaUrl: jest.fn((k) => k) } },
      ],
    }).compile();
    service = module.get<ReviewsService>(ReviewsService);
  });

  describe('findOne', () => {
    it('should return a review when found', async () => {
      prisma.reviews.findFirst.mockResolvedValue({ id: 1, rating: 5, description: 'Great product', media: [] });
      const result = await service.findOne(1);
      expect(result).toMatchObject({ rating: 5 });
    });

    it('should throw when not found', async () => {
      prisma.reviews.findFirst.mockRejectedValue(new Error('not found'));
      await expect(service.findOne(999)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should throw when review not found', async () => {
      prisma.reviews.findFirst.mockRejectedValue(new Error('not found'));
      await expect(service.remove(999)).rejects.toThrow();
    });
  });
});
