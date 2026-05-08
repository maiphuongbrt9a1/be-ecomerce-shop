import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('RecommendationService', () => {
  let service: RecommendationService;
  let prismaService: {
    productVariants: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      aggregate: jest.Mock;
    };
    categoryMapping: { findMany: jest.Mock };
    orderItems: { groupBy: jest.Mock };
    orders: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prismaService = {
      productVariants: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        aggregate: jest.fn(),
      },
      categoryMapping: { findMany: jest.fn() },
      orderItems: { groupBy: jest.fn() },
      orders: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<RecommendationService>(RecommendationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOutfitRecommendation', () => {
    it('should return empty array when product variant not found', async () => {
      prismaService.productVariants.findUnique.mockResolvedValue(null);

      const result = await service.getOutfitRecommendation(999);

      expect(result).toEqual([]);
    });

    it('should return empty array when product has no category', async () => {
      prismaService.productVariants.findUnique.mockResolvedValue({
        id: BigInt(1),
        product: { categoryId: null, category: null },
      });

      const result = await service.getOutfitRecommendation(1);

      expect(result).toEqual([]);
    });

    it('should return recommendations from mapped categories', async () => {
      prismaService.productVariants.findUnique.mockResolvedValue({
        id: BigInt(1),
        product: { categoryId: BigInt(1), category: { id: BigInt(1) } },
      });
      prismaService.categoryMapping.findMany.mockResolvedValue([
        { suggestCategoryId: BigInt(2) },
      ]);
      prismaService.productVariants.aggregate.mockResolvedValue({
        _max: { soldQuantity: 100 },
      });
      prismaService.orders.findMany.mockResolvedValue([{ id: BigInt(10) }]);

      const candidate = {
        id: BigInt(5),
        soldQuantity: 50,
        stock: 10,
        reviews: [{ rating: 4 }, { rating: 5 }],
      };
      prismaService.productVariants.findMany.mockResolvedValue([candidate]);
      prismaService.orderItems.groupBy.mockResolvedValue([
        { productVariantId: BigInt(5), _count: { _all: 1 } },
      ]);

      const result = await service.getOutfitRecommendation(1);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].id).toBe(BigInt(5));
    });

    it('should use fallback when no candidate has strong score', async () => {
      prismaService.productVariants.findUnique.mockResolvedValue({
        id: BigInt(1),
        product: { categoryId: BigInt(1), category: { id: BigInt(1) } },
      });
      prismaService.categoryMapping.findMany.mockResolvedValue([
        { suggestCategoryId: BigInt(3) },
      ]);
      prismaService.productVariants.aggregate.mockResolvedValue({
        _max: { soldQuantity: 1000 },
      });
      prismaService.orders.findMany.mockResolvedValue([]);

      const fallbackCandidate = {
        id: BigInt(20),
        soldQuantity: 200,
        stock: 5,
        reviews: [],
      };
      prismaService.productVariants.findMany.mockResolvedValue([fallbackCandidate]);
      prismaService.orderItems.groupBy.mockResolvedValue([]);

      const result = await service.getOutfitRecommendation(1);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe(BigInt(20));
    });

    it('should skip categories with no candidates', async () => {
      prismaService.productVariants.findUnique.mockResolvedValue({
        id: BigInt(1),
        product: { categoryId: BigInt(1), category: { id: BigInt(1) } },
      });
      prismaService.categoryMapping.findMany.mockResolvedValue([
        { suggestCategoryId: BigInt(4) },
      ]);
      prismaService.productVariants.aggregate.mockResolvedValue({
        _max: { soldQuantity: 100 },
      });
      prismaService.orders.findMany.mockResolvedValue([]);
      prismaService.productVariants.findMany.mockResolvedValue([]);

      const result = await service.getOutfitRecommendation(1);

      expect(result).toEqual([]);
    });
  });

  describe('calculateWeightedCosine (via getOutfitRecommendation)', () => {
    it('should score higher for candidates with co-purchase signal', async () => {
      prismaService.productVariants.findUnique.mockResolvedValue({
        id: BigInt(1),
        product: { categoryId: BigInt(1), category: { id: BigInt(1) } },
      });
      prismaService.categoryMapping.findMany.mockResolvedValue([
        { suggestCategoryId: BigInt(2) },
      ]);
      prismaService.productVariants.aggregate.mockResolvedValue({
        _max: { soldQuantity: 100 },
      });
      prismaService.orders.findMany.mockResolvedValue([
        { id: BigInt(10) },
        { id: BigInt(11) },
      ]);

      const candidateWithCoPurchase = {
        id: BigInt(5),
        soldQuantity: 10,
        stock: 5,
        reviews: [{ rating: 3 }],
      };
      const candidateWithout = {
        id: BigInt(6),
        soldQuantity: 10,
        stock: 5,
        reviews: [{ rating: 3 }],
      };
      prismaService.productVariants.findMany.mockResolvedValue([
        candidateWithCoPurchase,
        candidateWithout,
      ]);
      prismaService.orderItems.groupBy.mockResolvedValue([
        { productVariantId: BigInt(5), _count: { _all: 2 } },
      ]);

      const result = await service.getOutfitRecommendation(1);

      expect(result[0].id).toBe(BigInt(5));
    });
  });
});
