/*
  Warnings:

  - Added the required column `bankAccountName` to the `ReturnRequests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankAccountNumber` to the `ReturnRequests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankName` to the `ReturnRequests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."VietnamBankName" AS ENUM ('AGRIBANK', 'BIDV', 'VIETCOMBANK', 'VIETINBANK', 'MBBANK', 'ACB', 'TECHCOMBANK', 'VPBANK', 'TPBANK', 'SACOMBANK', 'HDBANK', 'VIB', 'OCB', 'SHB', 'SEABANK', 'EXIMBANK', 'MSB', 'NAMABANK', 'BACABANK', 'PVCOMBANK', 'ABBANK', 'LIENVIETPOSTBANK', 'KIENLONGBANK', 'VIETABANK', 'SAIGONBANK');

-- AlterTable
ALTER TABLE "public"."ReturnRequests" ADD COLUMN     "bankAccountName" VARCHAR(100) NOT NULL,
ADD COLUMN     "bankAccountNumber" VARCHAR(50) NOT NULL,
ADD COLUMN     "bankName" "public"."VietnamBankName" NOT NULL;
