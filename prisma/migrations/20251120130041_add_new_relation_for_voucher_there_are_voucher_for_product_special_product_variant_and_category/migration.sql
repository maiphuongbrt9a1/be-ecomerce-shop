-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "voucherId" BIGINT;

-- AlterTable
ALTER TABLE "public"."ProductVariants" ADD COLUMN     "voucherId" BIGINT;

-- AlterTable
ALTER TABLE "public"."Products" ADD COLUMN     "voucherId" BIGINT;

-- AddForeignKey
ALTER TABLE "public"."Products" ADD CONSTRAINT "Products_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "public"."Vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "public"."Vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariants" ADD CONSTRAINT "ProductVariants_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "public"."Vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
