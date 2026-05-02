-- CreateTable
CREATE TABLE "public"."PackageChecksums" (
    "id" BIGSERIAL NOT NULL,
    "ghnShopId" BIGINT,
    "shopId" BIGINT,
    "checksumData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageChecksums_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_packageChecksum_shop_id" ON "public"."PackageChecksums"("shopId");

-- CreateIndex
CREATE INDEX "idx_packageChecksum_ghn_shop_id" ON "public"."PackageChecksums"("ghnShopId");
