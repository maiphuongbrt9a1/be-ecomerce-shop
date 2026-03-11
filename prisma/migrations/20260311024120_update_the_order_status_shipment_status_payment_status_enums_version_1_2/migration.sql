/*
  Warnings:

  - The values [PROCESSING] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [IN_TRANSIT,OUT_FOR_DELIVERY,RETURNED_TO_SENDER] on the enum `ShipmentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."OrderStatus_new" AS ENUM ('PENDING', 'PAYMENT_PROCESSING', 'PAYMENT_CONFIRMED', 'WAITING_FOR_PICKUP', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'RETURNED');
ALTER TABLE "public"."Orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Orders" ALTER COLUMN "status" TYPE "public"."OrderStatus_new" USING ("status"::text::"public"."OrderStatus_new");
ALTER TYPE "public"."OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "public"."OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "public"."Orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ShipmentStatus_new" AS ENUM ('PENDING', 'WAITING_FOR_PICKUP', 'SHIPPED', 'DELIVERED', 'DELIVERED_FAILED', 'RETURNED');
ALTER TABLE "public"."Shipments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Shipments" ALTER COLUMN "status" TYPE "public"."ShipmentStatus_new" USING ("status"::text::"public"."ShipmentStatus_new");
ALTER TYPE "public"."ShipmentStatus" RENAME TO "ShipmentStatus_old";
ALTER TYPE "public"."ShipmentStatus_new" RENAME TO "ShipmentStatus";
DROP TYPE "public"."ShipmentStatus_old";
ALTER TABLE "public"."Shipments" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
