this is order following for the new code:

1. call api createNewAddressForOrder in address service to create new address for order,
2. After that call api groupOrderItemsToPackageShippingFollowingShopId in order service to group order items to packages.
3. After that call api previewShippingFeeForEachPackageForOrder in shipping service to calculate shipping fee for each package.
4. After that call api create in order service to create new order.

/\*\* this is old code for create new order function in orders service. Please review and refer to this code if you want to implement create new order function. I keep this code here for reference and comparison after I refactor the create new order function to make sure the refactored code is correct and has same functionality as this old code. \*/

- Creates a new order with associated shipping address, order items, payment, and shipment (if COD).
-
- This method performs the following operations within a database transaction:
- 1.  Creates a new shipping address for the order
- 2.  Validates that all product variants have sufficient stock
- 3.  Decrements stock for both product variants and products
- 4.  Calculates order totals (subtotal, discount, total amount)
- 5.  Creates the order record
- 6.  Creates order items linked to the order
- 7.  Creates a payment record with PENDING status
- 8.  Creates a shipment record if payment method is COD
-
- @param {CreateOrderDto} createOrderDto - The data transfer object containing order details including:
- - userId: The ID of the user creating the order
- - orderItems: Array of items to be ordered with productVariantId, quantity, unitPrice, totalPrice, and optional discountValue
- - Shipping address details: street, ward, district, province, zipCode, country
- - paymentMethod: The payment method (e.g., 'COD')
- - carrier: The shipping carrier
-
- @returns {Promise<OrdersWithFullInformation>} The created order with all related information including:
- - Order details (id, status, dates, amounts)
- - Shipping address
- - Order items
- - Payment information
- - Shipment details
-
- @throws {NotFoundException} If a product variant is not found or order not found after creation
- @throws {BadRequestException} If a product variant has insufficient stock or order creation fails
-
- @remarks
- - Uses database transaction to ensure data consistency
- - Shipping fee is currently hardcoded to 0
- - Shipment is only created for COD payments; other payment methods create shipment after successful payment
- - All monetary amounts are calculated from order item data
    \*/
    async create(
    createOrderDto: CreateOrderDto,
    ): Promise<OrdersWithFullInformation> {
    try {
    // prepare data for create new order
    return await this.prismaService.$transaction(async (tx) => {
    const userId = BigInt(createOrderDto.userId);
    const userInfo = await tx.user.findUnique({
    where: { id: userId },
    });

          if (!userInfo) {
            this.logger.log(`User with ID ${userId} not found!`);
            throw new NotFoundException(`User with ID ${userId} not found!`);
          }

          const newShippingAddress = await tx.address.create({
            data: {
              street: createOrderDto.street,
              ward: createOrderDto.ward,
              district: createOrderDto.district,
              province: createOrderDto.province,
              zipCode: createOrderDto.zipCode,
              country: createOrderDto.country,
              userId: userId,
            },
          });

          if (!newShippingAddress) {
            this.logger.log(
              `Failed to create shipping address for user with ID ${userId}`,
            );
            throw new BadRequestException(
              `Failed to create shipping address for user with ID ${userId}`,
            );
          }

          const processByStaff = null;
          const orderDate = new Date();
          const orderStatus = OrderStatus.PENDING;

          // grouping order items following shop office id to calculate shipping fee
          const packages: PackagesForShipping = {};
          let shippingFee = 0;
          let subTotal = 0;
          let discount = 0;
          let totalAmount = 0;

          // check order items is stock or out of stock
          // if order items are out of stock, throw error
          for (const item of createOrderDto.orderItems) {
            const productVariant = await tx.productVariants.findUnique({
              where: { id: BigInt(item.productVariantId) },
              include: {
                product: {
                  include: {
                    category: {
                      select: {
                        name: true,
                      },
                    },
                    shopOffice: {
                      select: {
                        ghnShopId: true,
                      },
                    },
                  },
                },
              },
            });

            if (!productVariant) {
              this.logger.log(
                `Product variant with ID ${item.productVariantId} not found!`,
              );
              throw new NotFoundException(
                `Product variant with ID ${item.productVariantId} not found!`,
              );
            }

            if (productVariant.stock < item.quantity) {
              this.logger.log(
                `Product variant with ID ${item.productVariantId} is out of stock! Available stock: ${productVariant.stock}, Requested quantity: ${item.quantity}`,
              );
              throw new BadRequestException(
                `Product variant with ID ${item.productVariantId} is out of stock! Available stock: ${productVariant.stock}, Requested quantity: ${item.quantity}`,
              );
            }

            // grouping order items following shop office id to calculate shipping fee
            if (
              !productVariant.product.shopOffice ||
              !productVariant.product.shopOffice.ghnShopId
            ) {
              this.logger.log(
                `ProductVariant have id ${productVariant.id} has no shop office id or ghn shop office id. Please check again!`,
              );
              throw new NotFoundException(
                `ProductVariant have id ${productVariant.id} has no shop office id or ghn shop office id. Please check again!`,
              );
            }

            // add order item to corresponding shop office package
            const ghnShopId =
              productVariant.product.shopOffice.ghnShopId.toString();

            const itemDetail: PackageItemDetail = {
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountDescription: item.discountDescription,
              discountType: item.discountType || null,
              discountValue: item.discountValue || 0,
              totalPrice: item.totalPrice,
              currencyUnit: item.currencyUnit,
              productVariantName: productVariant.variantName,
              productVariantSize: productVariant.variantSize,
              productVariantColor: productVariant.variantColor,
              productVariantSKU: productVariant.stockKeepingUnit,
            };

            const itemDetailForGHNCreateNewOrderRequest: PackageItemDetailForGHNCreateNewOrderRequest =
              {
                name: itemDetail.productVariantName,
                code: itemDetail.productVariantSKU,
                quantity: itemDetail.quantity,
                price: itemDetail.unitPrice,
                length: productVariant.variantLength,
                width: productVariant.variantWidth,
                height: productVariant.variantHeight,
                weight: productVariant.variantWeight,
                category: {
                  level1: productVariant.product.category?.name || 'Unknown',
                },
              };

            if (!packages[ghnShopId]) {
              packages[ghnShopId] = {
                packageItems: [] as PackageItemDetail[],
                packageItemsForGHNCreateNewOrderRequest:
                  [] as PackageItemDetailForGHNCreateNewOrderRequest[],
                totalWeight: 0, // in grams
                totalHeight: 0, // in cm
                maxLength: 0, // in cm
                maxWidth: 0, // in cm
                ghnShopId: 0,
                ghnShopDetail: {} as GHNShopDetail,
                ghnProvinceName: '',
                ghnDistrictName: '',
                ghnWardName: '',
                shippingService: {} as GetServiceResponse,
                shippingFee: 0, // in VND
                expectedDeliveryTime: {} as CalculateExpectedDeliveryTimeResponse,
                from_district_id: 0,
                from_ward_code: '',
                to_district_id: 0,
                to_ward_code: '',
              };
            }

            packages[ghnShopId].packageItemsForGHNCreateNewOrderRequest.push(
              itemDetailForGHNCreateNewOrderRequest,
            );

            packages[ghnShopId].packageItems.push(itemDetail);

            packages[ghnShopId].totalWeight +=
              item.quantity * productVariant.variantWeight;

            packages[ghnShopId].totalHeight +=
              item.quantity * productVariant.variantHeight;

            packages[ghnShopId].maxLength = Math.max(
              packages[ghnShopId].maxLength,
              productVariant.variantLength,
            );

            packages[ghnShopId].maxWidth = Math.max(
              packages[ghnShopId].maxWidth,
              productVariant.variantWidth,
            );

            // reduce stock quantity for product variant
            await tx.productVariants.update({
              where: { id: BigInt(item.productVariantId) },
              data: {
                stock: productVariant.stock - item.quantity,
              },
            });

            // reduce stock quantity for product
            await tx.products.update({
              where: { id: productVariant.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }

          // calculate shipping fee based on packages from different shop offices
          for (const ghnShopId in packages) {
            const shopOffice = await tx.shopOffice.findFirst({
              where: { ghnShopId: BigInt(ghnShopId) },
            });

            if (!shopOffice || !shopOffice.ghnShopId) {
              this.logger.log(
                `Shop office id connect with GHN shop ID ${ghnShopId} not found!`,
              );
              throw new NotFoundException(
                `Shop office id connect with GHN shop ID ${ghnShopId} not found!`,
              );
            }

            if (
              !shopOffice.ghnShopProvinceId ||
              !shopOffice.ghnShopDistrictId ||
              !shopOffice.ghnShopWardCode
            ) {
              this.logger.log(
                `Shop office id connect with GHN shop ID ${ghnShopId} has incomplete GHN address information!`,
              );
              throw new NotFoundException(
                `Shop office id connect with GHN shop ID ${ghnShopId} has incomplete GHN address information!`,
              );
            }

            const ghnConfig = {
              token: process.env.GHN_TOKEN!, // Thay bằng token của bạn
              shopId: Number(ghnShopId), // Thay bằng shopId của bạn
              host: process.env.GHN_HOST!,
              trackingHost: process.env.GHN_TRACKING_HOST!,
              testMode: process.env.GHN_TEST_MODE === 'true', // Bật chế độ test sẽ ghi đè tất cả host thành môi trường sandbox
            };
            const ghn = new Ghn(ghnConfig);
            const ghnShops = new GHNShops(ghnConfig);

            const totalWeightForOnePackage = packages[ghnShopId].totalWeight;
            const totalHeightForOnePackage = packages[ghnShopId].totalHeight;
            const maxLengthForOnePackage = packages[ghnShopId].maxLength;
            const maxWidthForOnePackage = packages[ghnShopId].maxWidth;

            // Lấy danh sách các tỉnh
            const GHNProvinces = await ghn.address.getProvinces();

            // tìm tỉnh ứng với tỉnh của người khách hàng cung cấp
            const candidateProvince = GHNProvinces.filter(
              (p) =>
                Array.isArray(p.NameExtension) &&
                p.IsEnable === 1 &&
                p.Status === 1 &&
                p.NameExtension.some((name) =>
                  name?.includes(createOrderDto.province),
                ),
            );

            if (!candidateProvince || candidateProvince.length === 0) {
              this.logger.log(`Province ${createOrderDto.province} not found`);
              throw new NotFoundException(
                `Province ${createOrderDto.province} not found`,
              );
            }

            let toProvince: GhnProvince | undefined;
            let toDistrict: GhnDistrict | undefined;
            let toWard: GhnWard | undefined;

            for (const province of candidateProvince) {
              // Lấy danh sách quận/huyện trong tỉnh đó
              const districtsOfToProvince = await ghn.address.getDistricts(
                province.ProvinceID,
              );

              if (!districtsOfToProvince || districtsOfToProvince.length === 0) {
                continue; // nếu không có quận/huyện nào trong tỉnh này, tiếp tục kiểm tra tỉnh tiếp theo
              }

              // tìm quận/huyện ứng với quận/huyện của người khách hàng cung cấp
              toDistrict = districtsOfToProvince.find(
                (d) =>
                  Array.isArray(d.NameExtension) &&
                  d.NameExtension.some((name) =>
                    name?.includes(createOrderDto.district),
                  ),
              );

              if (!toDistrict) {
                continue; // nếu không tìm thấy quận/huyện trong tỉnh này, tiếp tục tìm ở tỉnh khác
              }

              // Lấy danh sách phường/xã trong quận/huyện đó
              const wardsOfToDistrict = await ghn.address.getWards(
                toDistrict.DistrictID,
              );

              if (!wardsOfToDistrict || wardsOfToDistrict.length === 0) {
                continue; // nếu không có phường/xã nào trong quận/huyện này, tiếp tục kiểm tra tỉnh tiếp theo
              }

              // tìm phường/xã ứng với phường/xã của người khách hàng cung cấp
              toWard = wardsOfToDistrict.find(
                (w) =>
                  Array.isArray(w.NameExtension) &&
                  w.NameExtension.some((name) =>
                    name?.includes(createOrderDto.ward),
                  ),
              );
              if (!toWard) {
                continue; // nếu không tìm thấy phường/xã trong quận/huyện này, tiếp tục tìm ở tỉnh khác
              }

              // nếu tìm thấy đầy đủ tỉnh, quận/huyện, phường/xã thì dừng việc tìm kiếm
              toProvince = province;
              break;
            }

            if (!toProvince || !toDistrict || !toWard) {
              this.logger.log(
                `Could not find complete address information for province: ${createOrderDto.province}, district: ${createOrderDto.district}, ward: ${createOrderDto.ward}`,
              );
              throw new NotFoundException(
                `Could not find complete address information for province: ${createOrderDto.province}, district: ${createOrderDto.district}, ward: ${createOrderDto.ward}`,
              );
            }

            // Lấy ra thông tin chi chi tiết shop office từ ghnShopId
            const ghnShopList = await ghnShops.getShopList();
            const ghnShopInfo = ghnShops.getShopInfo(
              ghnConfig.shopId,
              ghnShopList,
            );

            const fromProvince = GHNProvinces.find(
              (p) => p.ProvinceID == Number(shopOffice.ghnShopProvinceId),
            );

            if (!fromProvince) {
              this.logger.log(
                `Province with ID ${shopOffice.ghnShopProvinceId} not found for shop office with GHN shop ID ${ghnShopId}`,
              );
              throw new NotFoundException(
                `Province with ID ${shopOffice.ghnShopProvinceId} not found for shop office with GHN shop ID ${ghnShopId}`,
              );
            }

            const districtsOfFromProvince = await ghn.address.getDistricts(
              fromProvince.ProvinceID,
            );

            if (
              !districtsOfFromProvince ||
              districtsOfFromProvince.length === 0
            ) {
              this.logger.log(
                `Districts not found for province with ID ${shopOffice.ghnShopProvinceId}`,
              );
              throw new NotFoundException(
                `Districts not found for province with ID ${shopOffice.ghnShopProvinceId}`,
              );
            }

            const fromDistrict = districtsOfFromProvince.find(
              (d) => d.DistrictID == Number(shopOffice.ghnShopDistrictId),
            );

            if (!fromDistrict) {
              this.logger.log(
                `District with ID ${shopOffice.ghnShopDistrictId} not found for shop office with GHN shop ID ${ghnShopId}`,
              );
              throw new NotFoundException(
                `District with ID ${shopOffice.ghnShopDistrictId} not found for shop office with GHN shop ID ${ghnShopId}`,
              );
            }

            const wardsOfFromDistrict = await ghn.address.getWards(
              fromDistrict.DistrictID,
            );

            if (!wardsOfFromDistrict || wardsOfFromDistrict.length === 0) {
              this.logger.log(
                `Wards not found for district with ID ${shopOffice.ghnShopDistrictId}`,
              );
              throw new NotFoundException(
                `Wards not found for district with ID ${shopOffice.ghnShopDistrictId}`,
              );
            }

            const fromWard = wardsOfFromDistrict.find(
              (w) => w.WardCode == shopOffice.ghnShopWardCode,
            );

            if (!fromWard) {
              this.logger.log(
                `Ward with code ${shopOffice.ghnShopWardCode} not found for shop office with GHN shop ID ${ghnShopId}`,
              );
              throw new NotFoundException(
                `Ward with code ${shopOffice.ghnShopWardCode} not found for shop office with GHN shop ID ${ghnShopId}`,
              );
            }

            // Lấy dịch vụ vận chuyển đầu tiên trong danh sách dịch vụ có sẵn (hard code)
            const service = (
              await ghn.calculateFee.getServiceList(
                ghnShopInfo.district_id,
                toDistrict.DistrictID,
              )
            )[0];
            this.logger.log(
              `Found service: ${service?.short_name}. From district ${ghnShopInfo.district_id} to district ${toDistrict.DistrictID}`,
            );

            // Tính phí vận chuyển
            const fee = await ghn.calculateFee.calculateShippingFee({
              to_district_id: toDistrict.DistrictID,
              to_ward_code: toWard.WardCode,
              service_type_id: service.service_type_id,

              // Thông tin sản phẩm cần vận chuyển
              // Sau đây chỉ là thông tin mẫu, bạn cần thay đổi thông tin sản phẩm cần vận chuyển
              height: totalHeightForOnePackage,
              weight: totalWeightForOnePackage,
              length: maxLengthForOnePackage,
              width: maxWidthForOnePackage,
            });

            // tính thời gian dự kiến giao hàng
            const expectedDeliveryTime =
              await ghn.order.calculateExpectedDeliveryTime({
                service_id: service.service_id,
                to_district_id: toDistrict.DistrictID,
                to_ward_code: toWard.WardCode,
                from_district_id: ghnShopInfo.district_id,
                from_ward_code: ghnShopInfo.ward_code,
              });

            packages[ghnShopId].ghnShopId = Number(ghnShopId);
            packages[ghnShopId].ghnShopDetail = ghnShopInfo;
            packages[ghnShopId].ghnProvinceName = fromProvince.ProvinceName;
            packages[ghnShopId].ghnDistrictName = fromDistrict.DistrictName;
            packages[ghnShopId].ghnWardName = fromWard.WardName;
            packages[ghnShopId].shippingFee = fee.total;
            packages[ghnShopId].shippingService = service;
            packages[ghnShopId].from_district_id = ghnShopInfo.district_id;
            packages[ghnShopId].from_ward_code = ghnShopInfo.ward_code;
            packages[ghnShopId].to_district_id = toDistrict.DistrictID;
            packages[ghnShopId].to_ward_code = toWard.WardCode;
            packages[ghnShopId].expectedDeliveryTime = expectedDeliveryTime;

            shippingFee += fee.total;
          }

          // calculate sub total, discount and total amount

          for (const item of createOrderDto.orderItems) {
            subTotal += item.totalPrice;
            discount += item.discountValue ? item.discountValue : 0;
          }

          totalAmount = subTotal + shippingFee - discount;

          // create new order
          const result = await tx.orders.create({
            data: {
              userId: userId,
              shippingAddressId: newShippingAddress.id,
              processByStaffId: processByStaff,
              orderDate: orderDate,
              status: orderStatus,
              subTotal: subTotal,
              shippingFee: shippingFee,
              discount: discount,
              totalAmount: totalAmount,
              description: createOrderDto.description,
            },
          });

          if (!result) {
            this.logger.log(`Failed to create order for user with ID ${userId}`);
            throw new BadRequestException(
              `Failed to create order for user with ID ${userId}`,
            );
          }

          // please create order items after creating order
          const newOrderItemsInDB: Record<string, bigint> = {};
          for (const item of createOrderDto.orderItems) {
            const newOrderItem = await tx.orderItems.create({
              data: {
                orderId: result.id,
                productVariantId: BigInt(item.productVariantId),
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                discountValue: item.discountValue ? item.discountValue : 0,
              },
            });

            if (!newOrderItem) {
              this.logger.log(
                `Failed to create order item for product variant with ID ${item.productVariantId}`,
              );
              throw new BadRequestException(
                `Failed to create order item for product variant with ID ${item.productVariantId}`,
              );
            }

            newOrderItemsInDB[item.productVariantId.toString()] = newOrderItem.id;
          }

          // fix from here. Tomorrow review again
          /////////////////////////////////////////////////

          // please create payments after creating order
          const newPayment = await tx.payments.create({
            // todo
            data: {
              orderId: result.id,
              transactionId: `${Date.now()}-${result.id}-${userId}-${Math.floor(
                Math.random() * 10000000,
              )}`,
              paymentMethod: createOrderDto.paymentMethod,
              amount: result.totalAmount,
              status: PaymentStatus.PENDING,
            },
          });

          if (!newPayment) {
            this.logger.log(
              `Failed to create payment for order with ID ${result.id}`,
            );
            throw new BadRequestException(
              `Failed to create payment for order with ID ${result.id}`,
            );
          }

          /// fix end here
          // tomorrow review again
          ///////////////////////////////

          // if COD, please create shipment after creating order
          // if other payment method, shipment will be created after payment is successful
          // please check update payment method in payments service to see more details about creating shipment after payment is successful
          if (createOrderDto.paymentMethod === PaymentMethod.COD) {
            for (const ghnShopId in packages) {
              const shopOffice = await tx.shopOffice.findFirst({
                where: { ghnShopId: BigInt(ghnShopId) },
                select: { id: true, ghnShopId: true },
              });

              if (!shopOffice || !shopOffice.ghnShopId) {
                this.logger.log(
                  `Shop office id connect with GHN shop ID ${ghnShopId} not found!`,
                );
                throw new NotFoundException(
                  `Shop office id connect with GHN shop ID ${ghnShopId} not found!`,
                );
              }

              // create order on GHN
              const ghnConfig = {
                token: process.env.GHN_TOKEN!, // Thay bằng token của bạn
                shopId: Number(ghnShopId), // Thay bằng shopId của bạn
                host: process.env.GHN_HOST!,
                trackingHost: process.env.GHN_TRACKING_HOST!,
                testMode: process.env.GHN_TEST_MODE === 'true', // Bật chế độ test sẽ ghi đè tất cả host thành môi trường sandbox
              };
              const ghn = new Ghn(ghnConfig);
              let contentForGhnOrder = '';
              for (const item of packages[ghnShopId].packageItems) {
                contentForGhnOrder += `${item.productVariantName} - SKU: ${item.productVariantSKU} - Size: ${item.productVariantSize} - Color: ${item.productVariantColor} - Quantity: ${item.quantity} - Unit Price: ${item.unitPrice} ${item.currencyUnit}\n`;
              }

              const ghnCreateNewOrderRequest = await ghn.order.createOrder({
                from_address: packages[ghnShopId].ghnShopDetail.address,
                from_name: packages[ghnShopId].ghnShopDetail.name,
                from_phone: packages[ghnShopId].ghnShopDetail.phone,
                from_province_name: packages[ghnShopId].ghnProvinceName,
                from_district_name: packages[ghnShopId].ghnDistrictName,
                from_ward_name: packages[ghnShopId].ghnWardName,

                payment_type_id: 2, // 1: seller pay, 2: buyer pay
                note: createOrderDto.description
                  ? createOrderDto.description
                  : '',
                required_note:
                  'KHONGCHOXEMHANG' /**Note shipping order.Allowed values: CHOTHUHANG, CHOXEMHANGKHONGTHU, KHONGCHOXEMHANG. CHOTHUHANG mean Buyer can request to see and trial goods. CHOXEMHANGKHONGTHU mean Buyer can see goods but not allow to trial goods. KHONGCHOXEMHANG mean Buyer not allow to see goods */,
                return_phone: packages[ghnShopId].ghnShopDetail.phone,
                return_address: packages[ghnShopId].ghnShopDetail.address,
                return_district_id: packages[ghnShopId].from_district_id,
                return_ward_code: packages[ghnShopId].from_ward_code,
                client_order_code: null,
                to_name: userInfo.firstName + ' ' + userInfo.lastName,
                to_phone: createOrderDto.phone,
                to_address:
                  createOrderDto.street +
                  ' ' +
                  createOrderDto.ward +
                  ' ' +
                  createOrderDto.district +
                  ' ' +
                  createOrderDto.province,
                to_ward_code: packages[ghnShopId].to_ward_code,
                to_district_id: packages[ghnShopId].to_district_id,
                cod_amount: totalAmount,
                content: contentForGhnOrder,
                weight: packages[ghnShopId].totalWeight,
                length: packages[ghnShopId].maxLength,
                width: packages[ghnShopId].maxWidth,
                height: packages[ghnShopId].totalHeight,
                pick_station_id: undefined,
                insurance_value: totalAmount < 5000000 ? totalAmount : 5000000,
                service_id: packages[ghnShopId].shippingService.service_id,
                service_type_id:
                  packages[ghnShopId].shippingService.service_type_id,
                coupon: null,
                pick_shift: undefined,
                items:
                  packages[ghnShopId].packageItemsForGHNCreateNewOrderRequest,
              });

              if (!ghnCreateNewOrderRequest) {
                this.logger.log(
                  `Failed to create order on GHN for shop office with GHN shop ID ${ghnShopId}`,
                );
                throw new BadRequestException(
                  `Failed to create order on GHN for shop office with GHN shop ID ${ghnShopId}`,
                );
              }

              // create shipment record in database
              const newShipment = await tx.shipments.create({
                data: {
                  orderId: result.id,
                  processByStaffId: processByStaff,
                  ghnOrderCode: ghnCreateNewOrderRequest.order_code,
                  shopOfficeId: BigInt(shopOffice.id),
                  estimatedDelivery:
                    ghnCreateNewOrderRequest.expected_delivery_time,
                  estimatedShipDate:
                    ghnCreateNewOrderRequest.expected_delivery_time,
                  carrier: createOrderDto.carrier,
                  trackingNumber: ghnCreateNewOrderRequest.order_code,
                  status: ShipmentStatus.WAITING_FOR_PICKUP,
                  description: createOrderDto.description
                    ? createOrderDto.description
                    : '',
                },
              });

              if (!newShipment) {
                this.logger.log(
                  `Failed to create shipment for order with ID ${result.id}`,
                );
                throw new BadRequestException(
                  `Failed to create shipment for order with ID ${result.id}`,
                );
              }

              // create shipment items record in database
              for (const item of packages[ghnShopId].packageItems) {
                const newShipmentItem = await tx.shipmentItems.create({
                  data: {
                    shipmentId: newShipment.id,
                    orderItemId:
                      newOrderItemsInDB[item.productVariantId.toString()],
                  },
                });

                if (!newShipmentItem) {
                  this.logger.log(
                    `Failed to create shipment item for order item with product variant ID ${item.productVariantId}`,
                  );
                  throw new BadRequestException(
                    `Failed to create shipment item for order item with product variant ID ${item.productVariantId}`,
                  );
                }
              }
            }
          }

          // log and return result
          const returnResult = await tx.orders.findUnique({
            where: { id: result.id },
            include: OrdersWithFullInformationInclude,
          });

          if (!returnResult) {
            throw new NotFoundException('Order not found after creation!');
          }

          this.logger.log(`Order created with ID: ${returnResult.id}`);
          return returnResult;
        });

    } catch (error) {
    this.logger.error('Failed to create order: ', error);
    throw new BadRequestException('Failed to create order');
    }
    }
