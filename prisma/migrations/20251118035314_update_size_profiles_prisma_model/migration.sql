/*
  Warnings:

  - You are about to drop the column `hipsCm` on the `SizeProfiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."SizeProfiles" DROP COLUMN "hipsCm",
ALTER COLUMN "heightCm" DROP NOT NULL,
ALTER COLUMN "weightKg" DROP NOT NULL,
ALTER COLUMN "chestCm" DROP NOT NULL,
ALTER COLUMN "hipCm" DROP NOT NULL,
ALTER COLUMN "sleeveLengthCm" DROP NOT NULL,
ALTER COLUMN "inseamCm" DROP NOT NULL,
ALTER COLUMN "shoulderLengthCm" DROP NOT NULL;
