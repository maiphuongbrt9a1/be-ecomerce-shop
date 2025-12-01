-- AlterTable
ALTER TABLE "public"."Media" ADD COLUMN     "isShopBanner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isShopLogo" BOOLEAN NOT NULL DEFAULT false;
