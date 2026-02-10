/*
  Warnings:

  - A unique constraint covering the columns `[ghnOrderCode]` on the table `Shipments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ghnShopId]` on the table `ShopOffice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Shipments" ADD COLUMN     "ghnOrderCode" VARCHAR(100),
ADD COLUMN     "shopOfficeId" BIGINT;

-- AlterTable
ALTER TABLE "public"."ShopOffice" ADD COLUMN     "ghnShopId" BIGINT;

-- CreateTable
CREATE TABLE "public"."ShipmentItems" (
    "id" BIGSERIAL NOT NULL,
    "shipmentId" BIGINT NOT NULL,
    "orderItemId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipmentItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_shipmentItem_shipment_id" ON "public"."ShipmentItems"("shipmentId");

-- CreateIndex
CREATE INDEX "idx_shipmentItem_order_item_id" ON "public"."ShipmentItems"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipments_ghnOrderCode_key" ON "public"."Shipments"("ghnOrderCode");

-- CreateIndex
CREATE UNIQUE INDEX "ShopOffice_ghnShopId_key" ON "public"."ShopOffice"("ghnShopId");

-- AddForeignKey
ALTER TABLE "public"."Shipments" ADD CONSTRAINT "Shipments_shopOfficeId_fkey" FOREIGN KEY ("shopOfficeId") REFERENCES "public"."ShopOffice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShipmentItems" ADD CONSTRAINT "ShipmentItems_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "public"."Shipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShipmentItems" ADD CONSTRAINT "ShipmentItems_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "public"."OrderItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
