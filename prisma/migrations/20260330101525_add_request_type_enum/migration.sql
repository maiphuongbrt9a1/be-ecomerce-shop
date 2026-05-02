/*
  Warnings:

  - The `subject` column on the `Requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."RequestType" AS ENUM ('RETURN_REQUEST', 'CANCEL_REQUEST', 'CUSTOMER_SUPPORT');

-- AlterTable
ALTER TABLE "public"."Requests" DROP COLUMN "subject",
ADD COLUMN     "subject" "public"."RequestType" NOT NULL DEFAULT 'CUSTOMER_SUPPORT';
