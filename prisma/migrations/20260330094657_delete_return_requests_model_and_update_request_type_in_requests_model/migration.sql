/*
  Warnings:

  - You are about to drop the column `subject` on the `Requests` table. All the data in the column will be lost.
  - You are about to drop the `ReturnRequests` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."RequestType" AS ENUM ('RETURN_REQUEST', 'CUSTOMER_SUPPORT', 'CANCEL_ORDER');

-- DropForeignKey
ALTER TABLE "public"."ReturnRequests" DROP CONSTRAINT "ReturnRequests_requestId_fkey";

-- AlterTable
ALTER TABLE "public"."Requests" DROP COLUMN "subject",
ADD COLUMN     "requestType" "public"."RequestType" NOT NULL DEFAULT 'CUSTOMER_SUPPORT';

-- DropTable
DROP TABLE "public"."ReturnRequests";
