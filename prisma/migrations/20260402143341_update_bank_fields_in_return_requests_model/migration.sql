-- AlterTable
ALTER TABLE "public"."ReturnRequests" ALTER COLUMN "bankAccountName" DROP NOT NULL,
ALTER COLUMN "bankAccountNumber" DROP NOT NULL,
ALTER COLUMN "bankName" DROP NOT NULL;
