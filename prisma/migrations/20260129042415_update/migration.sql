/*
  Warnings:

  - The `paymentMethod` column on the `Payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('COD', 'VNPAY', 'MOMO', 'ZALOPAY', 'CREDIT_CARD', 'BANK_TRANSFER');

-- AlterTable
ALTER TABLE "public"."Payments" DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "public"."PaymentMethod" NOT NULL DEFAULT 'COD';
