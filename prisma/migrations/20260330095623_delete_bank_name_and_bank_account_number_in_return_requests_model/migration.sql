/*
  Warnings:

  - You are about to drop the column `bankAccountNumber` on the `ReturnRequests` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `ReturnRequests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ReturnRequests" DROP COLUMN "bankAccountNumber",
DROP COLUMN "bankName";
