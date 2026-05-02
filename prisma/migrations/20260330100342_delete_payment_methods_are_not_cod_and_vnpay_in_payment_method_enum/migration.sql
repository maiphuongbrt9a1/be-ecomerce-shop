/*
  Warnings:

  - The values [MOMO,ZALOPAY,CREDIT_CARD,BANK_TRANSFER] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PaymentMethod_new" AS ENUM ('COD', 'VNPAY');
ALTER TABLE "public"."Payments" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "public"."Payments" ALTER COLUMN "paymentMethod" TYPE "public"."PaymentMethod_new" USING ("paymentMethod"::text::"public"."PaymentMethod_new");
ALTER TYPE "public"."PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "public"."PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
ALTER TABLE "public"."Payments" ALTER COLUMN "paymentMethod" SET DEFAULT 'COD';
COMMIT;
