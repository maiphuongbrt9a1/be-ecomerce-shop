-- AlterTable
ALTER TABLE "public"."ReturnRequests" ADD COLUMN     "bankAccountNumber" VARCHAR(50) NOT NULL DEFAULT '123456789',
ADD COLUMN     "bankName" VARCHAR(100) NOT NULL DEFAULT 'Vietcombank';
