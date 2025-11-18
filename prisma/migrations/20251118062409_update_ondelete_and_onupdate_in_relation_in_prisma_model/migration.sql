-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_createByUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItems" DROP CONSTRAINT "OrderItems_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItems" DROP CONSTRAINT "OrderItems_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Orders" DROP CONSTRAINT "Orders_processByStaffId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Orders" DROP CONSTRAINT "Orders_shippingAddressId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Orders" DROP CONSTRAINT "Orders_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payments" DROP CONSTRAINT "Payments_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductVariants" DROP CONSTRAINT "ProductVariants_createByUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Products" DROP CONSTRAINT "Products_createByUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Requests" DROP CONSTRAINT "Requests_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Requests" DROP CONSTRAINT "Requests_processByStaffId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Requests" DROP CONSTRAINT "Requests_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReturnRequests" DROP CONSTRAINT "ReturnRequests_requestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reviews" DROP CONSTRAINT "Reviews_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Shipments" DROP CONSTRAINT "Shipments_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Shipments" DROP CONSTRAINT "Shipments_processByStaffId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vouchers" DROP CONSTRAINT "Vouchers_createdBy_fkey";

-- AddForeignKey
ALTER TABLE "public"."Products" ADD CONSTRAINT "Products_createByUserId_fkey" FOREIGN KEY ("createByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_createByUserId_fkey" FOREIGN KEY ("createByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariants" ADD CONSTRAINT "ProductVariants_createByUserId_fkey" FOREIGN KEY ("createByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reviews" ADD CONSTRAINT "Reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "public"."Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_processByStaffId_fkey" FOREIGN KEY ("processByStaffId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItems" ADD CONSTRAINT "OrderItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItems" ADD CONSTRAINT "OrderItems_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "public"."ProductVariants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shipments" ADD CONSTRAINT "Shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shipments" ADD CONSTRAINT "Shipments_processByStaffId_fkey" FOREIGN KEY ("processByStaffId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payments" ADD CONSTRAINT "Payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vouchers" ADD CONSTRAINT "Vouchers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requests" ADD CONSTRAINT "Requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requests" ADD CONSTRAINT "Requests_processByStaffId_fkey" FOREIGN KEY ("processByStaffId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requests" ADD CONSTRAINT "Requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReturnRequests" ADD CONSTRAINT "ReturnRequests_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
