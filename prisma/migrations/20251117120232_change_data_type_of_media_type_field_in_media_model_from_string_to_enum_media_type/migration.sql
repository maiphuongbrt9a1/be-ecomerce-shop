/*
  Warnings:

  - The `type` column on the `Media` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- AlterTable
ALTER TABLE "public"."Media" DROP COLUMN "type",
ADD COLUMN     "type" "public"."MediaType" NOT NULL DEFAULT 'IMAGE';
