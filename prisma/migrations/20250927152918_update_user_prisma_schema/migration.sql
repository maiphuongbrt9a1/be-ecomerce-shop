/*
  Warnings:

  - Added the required column `codeActive` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codeActiveExpire` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "codeActive" UUID NOT NULL,
ADD COLUMN     "codeActiveExpire" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;
