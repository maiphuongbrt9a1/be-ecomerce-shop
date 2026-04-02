-- AlterTable
ALTER TABLE "public"."Shipments" ADD COLUMN     "ghnPickShiftId" BIGINT;

-- CreateTable
CREATE TABLE "public"."GhnPickShift" (
    "id" BIGSERIAL NOT NULL,
    "ghnShiftId" BIGINT NOT NULL,
    "ghnTitle" VARCHAR(255) NOT NULL,
    "ghnFromTime" BIGINT NOT NULL,
    "ghnToTime" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GhnPickShift_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Shipments" ADD CONSTRAINT "Shipments_ghnPickShiftId_fkey" FOREIGN KEY ("ghnPickShiftId") REFERENCES "public"."GhnPickShift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
