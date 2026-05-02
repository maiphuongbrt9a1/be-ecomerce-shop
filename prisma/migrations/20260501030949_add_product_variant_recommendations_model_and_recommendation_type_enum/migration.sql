-- CreateEnum
CREATE TYPE "public"."RecommendationType" AS ENUM ('OUTFIT');

-- CreateTable
CREATE TABLE "public"."ProductVariantRecommendations" (
    "id" BIGSERIAL NOT NULL,
    "sourceProductVariantId" BIGINT NOT NULL,
    "recommendedProductVariantId" BIGINT NOT NULL,
    "suitableCategoryScore" DOUBLE PRECISION NOT NULL,
    "popularityScore" DOUBLE PRECISION NOT NULL,
    "ratingScore" DOUBLE PRECISION NOT NULL,
    "coPurchaseScore" DOUBLE PRECISION NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "recommendationType" "public"."RecommendationType" NOT NULL DEFAULT 'OUTFIT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantRecommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductVariantRecommendations_sourceProductVariantId_idx" ON "public"."ProductVariantRecommendations"("sourceProductVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantRecommendations_sourceProductVariantId_recomm_key" ON "public"."ProductVariantRecommendations"("sourceProductVariantId", "recommendedProductVariantId");

-- AddForeignKey
ALTER TABLE "public"."ProductVariantRecommendations" ADD CONSTRAINT "ProductVariantRecommendations_sourceProductVariantId_fkey" FOREIGN KEY ("sourceProductVariantId") REFERENCES "public"."ProductVariants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariantRecommendations" ADD CONSTRAINT "ProductVariantRecommendations_recommendedProductVariantId_fkey" FOREIGN KEY ("recommendedProductVariantId") REFERENCES "public"."ProductVariants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
