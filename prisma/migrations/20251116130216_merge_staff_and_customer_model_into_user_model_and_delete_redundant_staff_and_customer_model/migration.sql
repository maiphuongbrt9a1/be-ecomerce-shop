/*
  Warnings:

  - You are about to drop the column `customerId` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Requests` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Reviews` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `SizeProfiles` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `UserVouchers` table. All the data in the column will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Staff` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[staffCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `SizeProfiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserVouchers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Cart" DROP CONSTRAINT "Cart_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Customer" DROP CONSTRAINT "Customer_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Orders" DROP CONSTRAINT "Orders_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Requests" DROP CONSTRAINT "Requests_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reviews" DROP CONSTRAINT "Reviews_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SizeProfiles" DROP CONSTRAINT "SizeProfiles_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Staff" DROP CONSTRAINT "Staff_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserVouchers" DROP CONSTRAINT "UserVouchers_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vouchers" DROP CONSTRAINT "Vouchers_createdBy_fkey";

-- DropIndex
DROP INDEX "public"."Cart_customerId_key";

-- AlterTable
ALTER TABLE "public"."Cart" DROP COLUMN "customerId",
ADD COLUMN     "userId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Orders" DROP COLUMN "customerId",
ADD COLUMN     "userId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Requests" DROP COLUMN "customerId",
ADD COLUMN     "userId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Reviews" DROP COLUMN "customerId",
ADD COLUMN     "userId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SizeProfiles" DROP COLUMN "customerId",
ADD COLUMN     "userId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "loyaltyCard" VARCHAR(50),
ADD COLUMN     "staffCode" VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."UserVouchers" DROP COLUMN "customerId",
ADD COLUMN     "userId" BIGINT NOT NULL;

-- DropTable
DROP TABLE "public"."Customer";

-- DropTable
DROP TABLE "public"."Staff";

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "public"."Cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_staffCode_key" ON "public"."User"("staffCode");

-- AddForeignKey
ALTER TABLE "public"."SizeProfiles" ADD CONSTRAINT "SizeProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reviews" ADD CONSTRAINT "Reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vouchers" ADD CONSTRAINT "Vouchers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserVouchers" ADD CONSTRAINT "UserVouchers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requests" ADD CONSTRAINT "Requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
