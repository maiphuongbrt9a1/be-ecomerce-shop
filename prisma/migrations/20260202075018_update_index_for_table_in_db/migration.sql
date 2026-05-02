-- AlterTable
ALTER TABLE "public"."Payments" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."ShopOffice" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."UserVouchers" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "idx_address_user_id" ON "public"."Address"("userId");

-- CreateIndex
CREATE INDEX "idx_address_shop_office_id" ON "public"."Address"("shopOfficeId");

-- CreateIndex
CREATE INDEX "idx_cart_user_id" ON "public"."Cart"("userId");

-- CreateIndex
CREATE INDEX "idx_cartItem_cart_id" ON "public"."CartItems"("cartId");

-- CreateIndex
CREATE INDEX "idx_cartItem_product_variant_id" ON "public"."CartItems"("productVariantId");

-- CreateIndex
CREATE INDEX "idx_category_parent_id" ON "public"."Category"("parentId");

-- CreateIndex
CREATE INDEX "idx_category_shop_office_id" ON "public"."Category"("shopOfficeId");

-- CreateIndex
CREATE INDEX "idx_category_voucher_id" ON "public"."Category"("voucherId");

-- CreateIndex
CREATE INDEX "idx_category_created_by_user_id" ON "public"."Category"("createByUserId");

-- CreateIndex
CREATE INDEX "idx_media_review_id" ON "public"."Media"("reviewId");

-- CreateIndex
CREATE INDEX "idx_media_user_id" ON "public"."Media"("userId");

-- CreateIndex
CREATE INDEX "idx_media_product_variant_id" ON "public"."Media"("productVariantId");

-- CreateIndex
CREATE INDEX "idx_media_request_id" ON "public"."Media"("requestId");

-- CreateIndex
CREATE INDEX "idx_orderItem_order_id" ON "public"."OrderItems"("orderId");

-- CreateIndex
CREATE INDEX "idx_orderItem_product_variant_id" ON "public"."OrderItems"("productVariantId");

-- CreateIndex
CREATE INDEX "idx_order_user_id" ON "public"."Orders"("userId");

-- CreateIndex
CREATE INDEX "idx_order_shipping_address_id" ON "public"."Orders"("shippingAddressId");

-- CreateIndex
CREATE INDEX "idx_order_processed_by_staff_id" ON "public"."Orders"("processByStaffId");

-- CreateIndex
CREATE INDEX "idx_payment_order_id" ON "public"."Payments"("orderId");

-- CreateIndex
CREATE INDEX "idx_productVariant_product_id" ON "public"."ProductVariants"("productId");

-- CreateIndex
CREATE INDEX "idx_productVariant_voucher_id" ON "public"."ProductVariants"("voucherId");

-- CreateIndex
CREATE INDEX "idx_productVariant_color_id" ON "public"."ProductVariants"("colorId");

-- CreateIndex
CREATE INDEX "idx_productVariant_created_by_user_id" ON "public"."ProductVariants"("createByUserId");

-- CreateIndex
CREATE INDEX "idx_product_category_id" ON "public"."Products"("categoryId");

-- CreateIndex
CREATE INDEX "idx_product_shop_office_id" ON "public"."Products"("shopOfficeId");

-- CreateIndex
CREATE INDEX "idx_product_voucher_id" ON "public"."Products"("voucherId");

-- CreateIndex
CREATE INDEX "idx_product_created_by_user_id" ON "public"."Products"("createByUserId");

-- CreateIndex
CREATE INDEX "idx_request_user_id" ON "public"."Requests"("userId");

-- CreateIndex
CREATE INDEX "idx_request_processed_by_staff_id" ON "public"."Requests"("processByStaffId");

-- CreateIndex
CREATE INDEX "idx_request_order_id" ON "public"."Requests"("orderId");

-- CreateIndex
CREATE INDEX "idx_returnRequest_request_id" ON "public"."ReturnRequests"("requestId");

-- CreateIndex
CREATE INDEX "idx_review_product_id" ON "public"."Reviews"("productId");

-- CreateIndex
CREATE INDEX "idx_review_user_id" ON "public"."Reviews"("userId");

-- CreateIndex
CREATE INDEX "idx_review_product_variant_id" ON "public"."Reviews"("productVariantId");

-- CreateIndex
CREATE INDEX "idx_shipment_order_id" ON "public"."Shipments"("orderId");

-- CreateIndex
CREATE INDEX "idx_shipment_processed_by_staff_id" ON "public"."Shipments"("processByStaffId");

-- CreateIndex
CREATE INDEX "idx_sizeProfile_user_id" ON "public"."SizeProfiles"("userId");

-- CreateIndex
CREATE INDEX "idx_user_shop_office_id" ON "public"."User"("shopOfficeId");

-- CreateIndex
CREATE INDEX "idx_userVoucher_user_id" ON "public"."UserVouchers"("userId");

-- CreateIndex
CREATE INDEX "idx_userVoucher_voucher_id" ON "public"."UserVouchers"("voucherId");

-- CreateIndex
CREATE INDEX "idx_voucher_created_by_user_id" ON "public"."Vouchers"("createdBy");
