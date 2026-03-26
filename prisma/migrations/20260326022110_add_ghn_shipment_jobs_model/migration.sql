-- CreateEnum
CREATE TYPE "public"."GHNShipmentJobStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "public"."GHNShipmentJobs" (
    "id" BIGSERIAL NOT NULL,
    "orderId" BIGINT NOT NULL,
    "ghnOrderCode" VARCHAR(100),
    "status" "public"."GHNShipmentJobStatus" NOT NULL DEFAULT 'PENDING',
    "packagesForShipping" JSON NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GHNShipmentJobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GHNShipmentJobs_ghnOrderCode_key" ON "public"."GHNShipmentJobs"("ghnOrderCode");

-- CreateIndex
CREATE INDEX "idx_ghnShipmentJob_order_id" ON "public"."GHNShipmentJobs"("orderId");
