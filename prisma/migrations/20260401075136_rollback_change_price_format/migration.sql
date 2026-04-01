/*
  Warnings:

  - You are about to alter the column `unitPrice` on the `OrderItems` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `totalPrice` on the `OrderItems` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `discountValue` on the `OrderItems` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `subTotal` on the `Orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `shippingFee` on the `Orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `discount` on the `Orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `totalAmount` on the `Orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `amount` on the `Payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `price` on the `ProductVariants` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `variantHeight` on the `ProductVariants` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `variantLength` on the `ProductVariants` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `variantWeight` on the `ProductVariants` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `variantWidth` on the `ProductVariants` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `price` on the `Products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `heightCm` on the `SizeProfiles` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `weightKg` on the `SizeProfiles` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `chestCm` on the `SizeProfiles` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `hipCm` on the `SizeProfiles` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `sleeveLengthCm` on the `SizeProfiles` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `inseamCm` on the `SizeProfiles` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `shoulderLengthCm` on the `SizeProfiles` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `discountValue` on the `Vouchers` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "public"."OrderItems" ALTER COLUMN "unitPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "discountValue" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."Orders" ALTER COLUMN "subTotal" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "shippingFee" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "discount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."Payments" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."ProductVariants" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "variantHeight" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "variantLength" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "variantWeight" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "variantWidth" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."Products" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."SizeProfiles" ALTER COLUMN "heightCm" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "weightKg" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "chestCm" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "hipCm" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "sleeveLengthCm" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "inseamCm" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "shoulderLengthCm" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."Vouchers" ALTER COLUMN "discountValue" SET DATA TYPE DOUBLE PRECISION;
