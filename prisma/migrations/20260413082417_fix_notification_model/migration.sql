-- AlterTable
ALTER TABLE "public"."Notification" ALTER COLUMN "creatorId" DROP NOT NULL,
ALTER COLUMN "recipientId" DROP NOT NULL;
