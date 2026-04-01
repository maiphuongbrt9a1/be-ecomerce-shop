/*
  Warnings:

  - You are about to alter the column `unitPrice` on the `OrderItems` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `totalPrice` on the `OrderItems` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `discountValue` on the `OrderItems` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `subTotal` on the `Orders` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `shippingFee` on the `Orders` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `discount` on the `Orders` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `totalAmount` on the `Orders` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `amount` on the `Payments` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - The `vnp_CreateDate` column on the `Payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `price` on the `ProductVariants` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `variantHeight` on the `ProductVariants` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `variantLength` on the `ProductVariants` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `variantWeight` on the `ProductVariants` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `variantWidth` on the `ProductVariants` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `price` on the `Products` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `heightCm` on the `SizeProfiles` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `weightKg` on the `SizeProfiles` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `chestCm` on the `SizeProfiles` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `hipCm` on the `SizeProfiles` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `sleeveLengthCm` on the `SizeProfiles` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `inseamCm` on the `SizeProfiles` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `shoulderLengthCm` on the `SizeProfiles` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `discountValue` on the `Vouchers` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.

*/
-- AlterTable
ALTER TABLE "public"."OrderItems" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "discountValue" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "public"."Orders" ALTER COLUMN "subTotal" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "shippingFee" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "discount" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "public"."Payments" ADD COLUMN     "vnp_ExpireDate" BIGINT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2),
DROP COLUMN "vnp_CreateDate",
ADD COLUMN     "vnp_CreateDate" BIGINT;

-- AlterTable
ALTER TABLE "public"."ProductVariants" ALTER COLUMN "price" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "variantHeight" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "variantLength" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "variantWeight" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "variantWidth" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "public"."Products" ALTER COLUMN "price" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "public"."SizeProfiles" ALTER COLUMN "heightCm" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "weightKg" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "chestCm" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "hipCm" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "sleeveLengthCm" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "inseamCm" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "shoulderLengthCm" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "public"."Vouchers" ALTER COLUMN "discountValue" SET DATA TYPE DECIMAL(15,2);
