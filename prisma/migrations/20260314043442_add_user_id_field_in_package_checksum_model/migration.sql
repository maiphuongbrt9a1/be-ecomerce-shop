/*
  Warnings:

  - Added the required column `userId` to the `PackageChecksums` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PackageChecksums" ADD COLUMN     "userId" BIGINT NOT NULL;
