/*
  Warnings:

  - You are about to drop the column `shopOfficeId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `shopOfficeId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `shopOfficeId` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the column `shopOfficeId` on the `Shipments` table. All the data in the column will be lost.
  - You are about to drop the column `shopOfficeId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ShopOffice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Address" DROP CONSTRAINT "Address_shopOfficeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_shopOfficeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Products" DROP CONSTRAINT "Products_shopOfficeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Shipments" DROP CONSTRAINT "Shipments_shopOfficeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_shopOfficeId_fkey";

-- DropIndex
DROP INDEX "public"."Address_shopOfficeId_key";

-- DropIndex
DROP INDEX "public"."idx_address_shop_office_id";

-- DropIndex
DROP INDEX "public"."idx_category_shop_office_id";

-- DropIndex
DROP INDEX "public"."idx_product_shop_office_id";

-- DropIndex
DROP INDEX "public"."idx_user_shop_office_id";

-- AlterTable
ALTER TABLE "public"."Address" DROP COLUMN "shopOfficeId";

-- AlterTable
ALTER TABLE "public"."Category" DROP COLUMN "shopOfficeId";

-- AlterTable
ALTER TABLE "public"."Products" DROP COLUMN "shopOfficeId";

-- AlterTable
ALTER TABLE "public"."Shipments" DROP COLUMN "shopOfficeId";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "shopOfficeId";

-- DropTable
DROP TABLE "public"."ShopOffice";
