-- AlterTable
ALTER TABLE "public"."Orders" ALTER COLUMN "processByStaffId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."ProductVariants" ADD COLUMN     "colorId" BIGINT;

-- AlterTable
ALTER TABLE "public"."Requests" ALTER COLUMN "processByStaffId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Shipments" ALTER COLUMN "processByStaffId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."Color" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "hexCode" VARCHAR(7) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Color_name_key" ON "public"."Color"("name");

-- AddForeignKey
ALTER TABLE "public"."ProductVariants" ADD CONSTRAINT "ProductVariants_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "public"."Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
