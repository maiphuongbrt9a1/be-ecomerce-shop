/*
  Warnings:

  - Added the required column `expiredAt` to the `PackageChecksums` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PackageChecksums" ADD COLUMN     "expiredAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false;
