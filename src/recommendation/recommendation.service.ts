import { PrismaService } from '@/prisma/prisma.service';
import { ProductVariantWithReviews } from '@/helpers/types/productVariant-with-reviews';
import { RecommendationVector } from '@/helpers/types/recommendation-vector';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RecommendationService {
  private readonly WEIGHTS = {
    coPurchase: 0.5,
    categoryMatch: 0.3,
    popularity: 0.1,
    rating: 0.1,
  };
  private readonly MIN_MAGNITUDE = 0.4;

  constructor(private prismaService: PrismaService) {}

  async getOutfitRecommendation(productVariantId: number) {
    const sourceProductVariant =
      await this.prismaService.productVariants.findUnique({
        where: { id: BigInt(productVariantId) },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });

    if (!sourceProductVariant) return [];
    if (!sourceProductVariant.product.categoryId) return [];

    // 1. Lấy danh sách Category bổ trợ từ bảng Mapping (Dynamic)
    const categoryMappings = await this.prismaService.categoryMapping.findMany({
      where: {
        baseCategoryId: sourceProductVariant.product.categoryId,
      },
      select: {
        suggestCategoryId: true,
      },
    });
    const targetCatIds = categoryMappings.map((m) => m.suggestCategoryId);

    // 2. Lấy dữ liệu toàn cục để chuẩn hóa về sau.
    const maxSold = await this.getMaxSoldGlobal();
    const sourceOrderIds = await this.getSourceOrderIds(
      BigInt(productVariantId),
    );

    const finalOutfit: ProductVariantWithReviews[] = [];

    // 3. Diversification: Duyệt từng Category để lấy 1 sản phẩm tốt nhất
    for (const catId of targetCatIds) {
      const candidates: ProductVariantWithReviews[] =
        await this.prismaService.productVariants.findMany({
          where: {
            product: {
              categoryId: catId,
            },
            id: {
              not: BigInt(productVariantId),
            },
            stock: {
              gt: 0,
            },
          },
          include: {
            reviews: true,
          },
        });

      if (candidates.length === 0) continue;

      const candidateIds = candidates.map((c) => c.id);
      const commonOrdersData = await this.prismaService.orderItems.groupBy({
        by: ['productVariantId'],
        where: {
          orderId: { in: sourceOrderIds },
          productVariantId: { in: candidateIds },
        },
        _count: { _all: true },
      });

      // Tạo một Map để tra cứu nhanh: productVariantId -> số lần mua chung
      const commonOrdersMap = new Map(
        commonOrdersData.map((d) => [d.productVariantId, d._count._all]),
      );

      const scoredCandidates = candidates.map((candidate) => {
        const vector = this.extractVector(
          candidate,
          commonOrdersMap,
          sourceOrderIds,
          maxSold,
        );
        const score = this.calculateWeightedCosine(vector);
        const magnitude = this.calculateMagnitude(vector);
        return {
          candidate,
          score: magnitude >= this.MIN_MAGNITUDE ? score : 0,
        };
      });

      const bestMatch = scoredCandidates.sort((a, b) => b.score - a.score)[0];
      if (bestMatch && bestMatch.score > 0) {
        finalOutfit.push(bestMatch.candidate);
      }
    }

    return finalOutfit;
  }

  // --- HÀM BỔ TRỢ TOÁN HỌC ---

  private extractVector(
    candidate: ProductVariantWithReviews,
    commonOrdersMap: Map<bigint, number>,
    sourceOrderIds: bigint[],
    maxSold: number,
  ): RecommendationVector {
    // fix here
    // Co-purchase: Đếm số đơn hàng chung giữa sản phẩm nguồn và ứng viên
    const commonOrders = commonOrdersMap.get(candidate.id) ?? 0;

    const totalSold = candidate.soldQuantity;

    const avgRating =
      candidate.reviews.length > 0
        ? candidate.reviews.reduce((s, r) => s + r.rating, 0) /
          candidate.reviews.length /
          5
        : 0.6;

    return {
      coPurchase:
        sourceOrderIds.length > 0 ? commonOrders / sourceOrderIds.length : 0,
      categoryMatch: 1,
      popularity: Math.log(totalSold + 1) / Math.log(maxSold + 1),
      rating: avgRating,
    };
  }

  private calculateWeightedCosine(v: RecommendationVector): number {
    const W = this.WEIGHTS;
    const vecV = [
      v.coPurchase * W.coPurchase,
      v.categoryMatch * W.categoryMatch,
      v.popularity * W.popularity,
      v.rating * W.rating,
    ];
    const vecI = [W.coPurchase, W.categoryMatch, W.popularity, W.rating];

    let dot = 0,
      normV = 0,
      normI = 0;
    for (let i = 0; i < vecV.length; i++) {
      dot += vecV[i] * vecI[i];
      normV += vecV[i] ** 2;
      normI += vecI[i] ** 2;
    }
    return normV === 0 ? 0 : dot / (Math.sqrt(normV) * Math.sqrt(normI));
  }

  private calculateMagnitude(v: RecommendationVector): number {
    const W = this.WEIGHTS;
    return Math.sqrt(
      Math.pow(v.coPurchase * W.coPurchase, 2) +
        Math.pow(v.categoryMatch * W.categoryMatch, 2) +
        Math.pow(v.popularity * W.popularity, 2) +
        Math.pow(v.rating * W.rating, 2),
    );
  }

  private async getMaxSoldGlobal() {
    const res = await this.prismaService.productVariants.aggregate({
      _max: { soldQuantity: true },
    });
    return Number(res._max.soldQuantity) || 100;
  }

  private async getSourceOrderIds(productVariantId: bigint) {
    const orders = await this.prismaService.orders.findMany({
      where: { orderItems: { some: { productVariantId } } },
      select: { id: true },
    });
    return orders.map((o) => o.id);
  }
}
