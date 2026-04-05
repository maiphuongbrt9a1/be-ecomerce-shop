-- AlterTable
ALTER TABLE "public"."ProductVariants" ADD COLUMN     "isNewProductVariant" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "soldQuantity" INTEGER NOT NULL DEFAULT 0;
