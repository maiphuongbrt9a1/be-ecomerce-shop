-- AlterTable
ALTER TABLE "public"."OrderItems" ADD COLUMN     "appliedVoucherId" BIGINT;

-- AlterTable
ALTER TABLE "public"."UserVouchers" ADD COLUMN     "orderId" BIGINT;

-- AddForeignKey
ALTER TABLE "public"."OrderItems" ADD CONSTRAINT "OrderItems_appliedVoucherId_fkey" FOREIGN KEY ("appliedVoucherId") REFERENCES "public"."Vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserVouchers" ADD CONSTRAINT "UserVouchers_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
