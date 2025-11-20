/*
  Warnings:

  - A unique constraint covering the columns `[shopOfficeId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Address" ADD COLUMN     "shopOfficeId" BIGINT;

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "shopOfficeId" BIGINT;

-- AlterTable
ALTER TABLE "public"."Products" ADD COLUMN     "shopOfficeId" BIGINT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "shopOfficeId" BIGINT;

-- CreateTable
CREATE TABLE "public"."ShopOffice" (
    "id" BIGSERIAL NOT NULL,

    CONSTRAINT "ShopOffice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_shopOfficeId_key" ON "public"."Address"("shopOfficeId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_shopOfficeId_fkey" FOREIGN KEY ("shopOfficeId") REFERENCES "public"."ShopOffice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_shopOfficeId_fkey" FOREIGN KEY ("shopOfficeId") REFERENCES "public"."ShopOffice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Products" ADD CONSTRAINT "Products_shopOfficeId_fkey" FOREIGN KEY ("shopOfficeId") REFERENCES "public"."ShopOffice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_shopOfficeId_fkey" FOREIGN KEY ("shopOfficeId") REFERENCES "public"."ShopOffice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
