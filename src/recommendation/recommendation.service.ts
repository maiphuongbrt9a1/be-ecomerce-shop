import { PrismaService } from '@/prisma/prisma.service';
import { ProductVariantWithReviews } from '@/helpers/types/productVariant-with-reviews';
import { RecommendationVector } from '@/helpers/types/recommendation-vector';
import { Injectable } from '@nestjs/common';

/**
 * Service responsible for generating outfit recommendations for a product variant.
 *
 * This service implements a hybrid recommendation flow that combines dynamic
 * category mapping, co-purchase signals, popularity, and rating heuristics to
 * produce a diversified outfit recommendation for the user.
 *
 * @remarks
 * - Uses categoryMapping to avoid hardcoded outfit rules
 * - Returns at most one recommendation per mapped category
 * - Applies cosine similarity with heuristic weights
 * - Applies a magnitude threshold to reduce weak matches
 */
@Injectable()
export class RecommendationService {
  // các thống số này là heuristic được điều chỉnh dựa trên kinh nghiệm thực tế
  // và thử nghiệm để đạt được kết quả tốt nhất.
  private readonly WEIGHTS = {
    coPurchase: 0.5,
    categoryMatch: 0.3,
    popularity: 0.1,
    rating: 0.1,
  };
  private readonly MIN_MAGNITUDE = 0.3;

  constructor(private prismaService: PrismaService) {}

  /**
   * Generates a diversified outfit recommendation list for a source product variant.
   *
   * The method performs the following steps:
   * 1. Loads the source product variant and its category
   * 2. Fetches dynamic category mappings for outfit composition
   * 3. Collects global normalization data and source order history
   * 4. Loads candidates for each mapped category
   * 5. Scores each candidate using a weighted cosine similarity model
   * 6. Applies a magnitude threshold and fallback selection when needed
   *
   * @param {number} productVariantId - ID of the source product variant used as the recommendation anchor
   *
   * @returns {Promise<ProductVariantWithReviews[]>} A diversified list of recommended product variants
   *
   * @remarks
   * - Returns an empty array if the source product variant or its category is missing
   * - Returns at most one recommendation per target category
   * - Uses fallback logic to preserve recommendation coverage when no strong match exists
   */
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

        // Chỉ trả về điểm số nếu magnitude đủ lớn, ngược lại coi như không tương đồng
        // Điều này giúp tránh việc xếp hạng những sản phẩm có điểm số cao do một yếu tố duy nhất
        // nhưng lại thiếu sự tương đồng tổng thể.
        // quy ước 0 là điểm số không tương đồng nếu magnitude quá thấp,
        // giúp tăng tính đa dạng và tránh việc chỉ chọn những sản phẩm quá giống nhau.
        return {
          candidate,
          score: magnitude >= this.MIN_MAGNITUDE ? score : 0,
        };
      });

      const bestMatch = scoredCandidates.sort((a, b) => b.score - a.score)[0];
      if (bestMatch && bestMatch.score > 0) {
        finalOutfit.push(bestMatch.candidate);
      } else {
        // Nếu không có ứng viên nào đạt điểm số đủ tốt,
        // chọn ra sản phẩm có lượt bán cao nhất và đề xuất ra cho người dùng
        // để đảm bảo vẫn có sự đa dạng trong gợi ý, thay vì bỏ trống.
        const fallback = candidates.sort(
          (a, b) => b.soldQuantity - a.soldQuantity,
        )[0];
        if (fallback) {
          finalOutfit.push(fallback);
        }
      }
    }

    return finalOutfit;
  }

  // --- HÀM BỔ TRỢ TOÁN HỌC ---

  /**
   * Converts a candidate product variant into a normalized recommendation vector.
   *
   * The vector captures four signals:
   * - coPurchase: how often the candidate appears in the same orders as the source
   * - categoryMatch: category compatibility score after mapping-based filtering
   * - popularity: normalized sold quantity score
   * - rating: normalized average review score
   *
   * @param {ProductVariantWithReviews} candidate - Candidate variant to evaluate
   * @param {Map<bigint, number>} commonOrdersMap - Lookup map for co-purchase counts by variant ID
   * @param {bigint[]} sourceOrderIds - Order IDs containing the source product variant
   * @param {number} maxSold - Maximum sold quantity across all variants for normalization
   *
   * @returns {RecommendationVector} Normalized vector used by the scoring functions
   *
   * @remarks
   * - Co-purchase is normalized against the number of source orders
   * - Popularity uses log scaling to avoid domination by extreme best-sellers
   * - Rating defaults to 0.6 when no reviews are available
   */
  private extractVector(
    candidate: ProductVariantWithReviews,
    commonOrdersMap: Map<bigint, number>,
    sourceOrderIds: bigint[],
    maxSold: number,
  ): RecommendationVector {
    // Co-purchase: Đếm số đơn hàng chung giữa sản phẩm nguồn và ứng viên
    const commonOrders = commonOrdersMap.get(candidate.id) ?? 0;

    // Lấy ra số lượng đã bán để tính popularity
    const totalSold = candidate.soldQuantity;

    // Tính điểm rating trung bình, chuẩn hóa về [0,1]
    // Nếu không có đánh giá nào, giả định điểm trung bình là 3/5 = 0.6 để không quá bất lợi cho sản phẩm mới.
    const avgRating =
      candidate.reviews.length > 0
        ? candidate.reviews.reduce((s, r) => s + r.rating, 0) /
          candidate.reviews.length /
          5
        : 0.6;

    // Chuẩn hóa các yếu tố về [0,1] để đảm bảo tính công bằng khi tính điểm cosine similarity.
    // Co-purchase được chuẩn hóa bằng cách chia cho số đơn hàng của sản phẩm nguồn, nếu có.
    // Category match được đặt là 1 vì đã lọc theo category ở bước trước.
    // Popularity được chuẩn hóa bằng cách chia log(số đã bán + 1) cho log(max đã bán + 1) để tránh bị ảnh hưởng quá lớn bởi những sản phẩm bán chạy.
    // Rating đã được chuẩn hóa ở bước tính trung bình.
    return {
      coPurchase:
        sourceOrderIds.length > 0 ? commonOrders / sourceOrderIds.length : 0,
      categoryMatch: 1,
      popularity: Math.log(totalSold + 1) / Math.log(maxSold + 1),
      rating: avgRating,
    };
  }

  /**
   * Calculates the weighted cosine similarity score for a recommendation vector.
   *
   * This method compares the candidate vector against the weighted ideal vector
   * to produce a similarity score between 0 and 1.
   *
   * @param {RecommendationVector} v - Normalized candidate vector
   *
   * @returns {number} Weighted cosine similarity score
   *
   * @remarks
   * - Higher scores indicate closer alignment with the desired recommendation profile
   * - Returns 0 when the candidate vector has zero magnitude
   */
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

  /**
   * Calculates the magnitude of a recommendation vector.
   *
   * The magnitude is used as a quality gate before accepting a candidate score.
   *
   * @param {RecommendationVector} v - Normalized candidate vector
   *
   * @returns {number} Euclidean magnitude of the weighted vector
   *
   * @remarks
   * - Helps filter out candidates that score well on only one signal
   * - Used together with MIN_MAGNITUDE to enforce minimum quality
   */
  private calculateMagnitude(v: RecommendationVector): number {
    const W = this.WEIGHTS;
    return Math.sqrt(
      Math.pow(v.coPurchase * W.coPurchase, 2) +
        Math.pow(v.categoryMatch * W.categoryMatch, 2) +
        Math.pow(v.popularity * W.popularity, 2) +
        Math.pow(v.rating * W.rating, 2),
    );
  }

  /**
   * Retrieves the maximum sold quantity across all product variants.
   *
   * This value is used as a normalization baseline for popularity scoring.
   *
   * @returns {Promise<number>} Maximum sold quantity, or 100 when no data exists
   *
   * @remarks
   * - Returns a safe default when the catalog is empty
   * - Prevents division by zero in popularity normalization
   */
  private async getMaxSoldGlobal() {
    const res = await this.prismaService.productVariants.aggregate({
      _max: { soldQuantity: true },
    });

    // Nếu không có sản phẩm nào đã bán,
    // giả định maxSold là 100 để tránh chia cho 0
    // và vẫn cho phép phân phối điểm popularity hợp lý.
    return Number(res._max.soldQuantity) || 100;
  }

  /**
   * Retrieves the order IDs that contain the given product variant.
   *
   * These order IDs are used to compute co-purchase relationships against candidates.
   *
   * @param {bigint} productVariantId - Product variant ID used as the source anchor
   *
   * @returns {Promise<bigint[]>} List of order IDs containing the source variant
   *
   * @remarks
   * - The returned IDs are later used in intersection-style co-purchase scoring
   * - Returns an empty array when the source variant has no order history
   */
  private async getSourceOrderIds(productVariantId: bigint) {
    const orders = await this.prismaService.orders.findMany({
      where: { orderItems: { some: { productVariantId } } },
      select: { id: true },
    });
    return orders.map((o) => o.id);
  }
}
