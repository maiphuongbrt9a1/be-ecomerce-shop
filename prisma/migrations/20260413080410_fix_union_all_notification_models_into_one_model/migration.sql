/*
  Warnings:

  - You are about to drop the `PersonalNotification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShopNotification` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('SHOP_NOTIFICATION', 'PERSONAL_NOTIFICATION');

-- DropForeignKey
ALTER TABLE "public"."PersonalNotification" DROP CONSTRAINT "PersonalNotification_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ShopNotification" DROP CONSTRAINT "ShopNotification_creatorId_fkey";

-- DropTable
DROP TABLE "public"."PersonalNotification";

-- DropTable
DROP TABLE "public"."ShopNotification";

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL DEFAULT 'SHOP_NOTIFICATION',
    "creatorId" BIGINT NOT NULL,
    "recipientId" BIGINT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_notification_creator_id" ON "public"."Notification"("creatorId");

-- CreateIndex
CREATE INDEX "idx_notification_recipient_id" ON "public"."Notification"("recipientId");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
