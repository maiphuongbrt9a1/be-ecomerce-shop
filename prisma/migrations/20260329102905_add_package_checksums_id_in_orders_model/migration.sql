/*
  Warnings:

  - Added the required column `packageChecksumsId` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Orders" ADD COLUMN     "packageChecksumsId" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_packageChecksumsId_fkey" FOREIGN KEY ("packageChecksumsId") REFERENCES "public"."PackageChecksums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
