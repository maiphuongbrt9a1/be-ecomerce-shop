-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."OrderStatus" ADD VALUE 'PAYMENT_PROCESSING';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'PAYMENT_CONFIRMED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'WAITING_FOR_PICKUP';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'COMPLETED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ShipmentStatus" ADD VALUE 'PENDING';
ALTER TYPE "public"."ShipmentStatus" ADD VALUE 'SHIPPED';
ALTER TYPE "public"."ShipmentStatus" ADD VALUE 'RETURNED';
