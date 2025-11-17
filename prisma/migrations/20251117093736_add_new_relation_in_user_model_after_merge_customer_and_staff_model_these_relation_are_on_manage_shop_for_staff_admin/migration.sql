/*
  Warnings:

  - Added the required column `createByUserId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `processByStaffId` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createByUserId` to the `ProductVariants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createByUserId` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `processByStaffId` to the `Requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `processByStaffId` to the `Shipments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Products" DROP CONSTRAINT "Products_categoryId_fkey";

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "createByUserId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Orders" ADD COLUMN     "processByStaffId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "public"."ProductVariants" ADD COLUMN     "createByUserId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Products" ADD COLUMN     "createByUserId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Requests" ADD COLUMN     "processByStaffId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Shipments" ADD COLUMN     "processByStaffId" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Products" ADD CONSTRAINT "Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Products" ADD CONSTRAINT "Products_createByUserId_fkey" FOREIGN KEY ("createByUserId") REFERENCES "public"."User"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_createByUserId_fkey" FOREIGN KEY ("createByUserId") REFERENCES "public"."User"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariants" ADD CONSTRAINT "ProductVariants_createByUserId_fkey" FOREIGN KEY ("createByUserId") REFERENCES "public"."User"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_processByStaffId_fkey" FOREIGN KEY ("processByStaffId") REFERENCES "public"."User"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shipments" ADD CONSTRAINT "Shipments_processByStaffId_fkey" FOREIGN KEY ("processByStaffId") REFERENCES "public"."User"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requests" ADD CONSTRAINT "Requests_processByStaffId_fkey" FOREIGN KEY ("processByStaffId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
