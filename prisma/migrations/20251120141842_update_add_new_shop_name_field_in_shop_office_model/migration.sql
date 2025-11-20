/*
  Warnings:

  - Added the required column `shopName` to the `ShopOffice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ShopOffice" ADD COLUMN     "shopName" VARCHAR(255) NOT NULL;
