/*
  Warnings:

  - You are about to drop the column `requestType` on the `Requests` table. All the data in the column will be lost.
  - Added the required column `subject` to the `Requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Requests" DROP COLUMN "requestType",
ADD COLUMN     "subject" VARCHAR(255) NOT NULL;

-- DropEnum
DROP TYPE "public"."RequestType";

-- CreateTable
CREATE TABLE "public"."ReturnRequests" (
    "id" BIGSERIAL NOT NULL,
    "requestId" BIGINT NOT NULL,
    "bankName" VARCHAR(100) NOT NULL,
    "bankAccountNumber" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnRequests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReturnRequests_requestId_key" ON "public"."ReturnRequests"("requestId");

-- CreateIndex
CREATE INDEX "idx_returnRequest_request_id" ON "public"."ReturnRequests"("requestId");

-- AddForeignKey
ALTER TABLE "public"."ReturnRequests" ADD CONSTRAINT "ReturnRequests_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
