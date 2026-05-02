/*
  Warnings:

  - Made the column `colorId` on table `ProductVariants` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Orders" ALTER COLUMN "discount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."ProductVariants" ADD COLUMN     "variantHeight" DOUBLE PRECISION NOT NULL DEFAULT 5,
ADD COLUMN     "variantLength" DOUBLE PRECISION NOT NULL DEFAULT 25,
ADD COLUMN     "variantWeight" DOUBLE PRECISION NOT NULL DEFAULT 250,
ADD COLUMN     "variantWidth" DOUBLE PRECISION NOT NULL DEFAULT 20,
ALTER COLUMN "price" DROP DEFAULT,
ALTER COLUMN "stock" DROP DEFAULT,
ALTER COLUMN "colorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Products" ALTER COLUMN "stock" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."SizeProfiles" ALTER COLUMN "heightCm" SET DEFAULT 0,
ALTER COLUMN "weightKg" SET DEFAULT 0,
ALTER COLUMN "chestCm" SET DEFAULT 0,
ALTER COLUMN "hipCm" SET DEFAULT 0,
ALTER COLUMN "sleeveLengthCm" SET DEFAULT 0,
ALTER COLUMN "inseamCm" SET DEFAULT 0,
ALTER COLUMN "shoulderLengthCm" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Vouchers" ALTER COLUMN "discountValue" SET DEFAULT 0;
