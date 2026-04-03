import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  UpdateOrderDto,
  UpdateOrderFromWaitingForPickupToShippedDto,
} from './dto/update-order.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  OrderItems,
  Orders,
  OrderStatus,
  PaymentMethod,
  Payments,
  PaymentStatus,
  Prisma,
  Requests,
  RequestStatus,
  RequestType,
  ShipmentStatus,
  Vouchers,
  VoucherStatus,
} from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import {
  OrderItemsWithVariantAndMediaInformation,
  OrdersWithFullInformation,
  OrdersWithFullInformationInclude,
  PackageItemDetail,
  ShipmentsWithFullInformation,
  UserVoucherDetailInformation,
} from '@/helpers/types/types';
import {
  createPackageChecksum,
  formatMediaFieldWithLogging,
  formatMediaFieldWithLoggingForOrders,
  formatMediaFieldWithLoggingForShipments,
  GHNShops,
  /* getServerInternalIp,*/
} from '@/helpers/utils';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import { ShipmentsService } from '@/shipments/shipments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import Ghn from 'giaohangnhanh';
import dayjs from 'dayjs';
import { PaymentsService } from '@/payments/payments.service';
import { Cron } from '@nestjs/schedule';
import { MyPickShiftResponse } from '@/helpers/types/ghn-pick-shift-response';
/* import { VnpayRefundDto } from '@/payments/dto/vnpay-refund.dto';*/

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
    private readonly shipmentsService: ShipmentsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  /**
   * Creates a new order with full checkout processing and GHN shipment synchronization.
   *
   * This method performs the following operations:
   * 1. Validates package checksum, address integrity, and user consistency
   * 2. Validates stock and applies item-level and user-level voucher updates
   * 3. Creates order, order items, payment, shipment, and shipment items in a transaction
   * 4. Creates the shipping order on GHN after transaction commit
   * 5. Updates shipment tracking fields from GHN response
   * 6. Returns the created order with full related information
   *
   * @param {CreateOrderDto} createOrderDto - Checkout payload containing package, pricing, voucher, and shipping address data
   *
   * @returns {Promise<OrdersWithFullInformation>} The created order including address, items, payments, shipments, and formatted media fields
   *
   * @throws {BadRequestException} If validation fails, stock/voucher updates fail, GHN creation fails, or order creation flow fails
   * @throws {NotFoundException} If user, address, or related entities required for order creation are not found
   * @throws {InternalServerErrorException} If checksum secret configuration is missing
   *
   * @remarks
   * - The flow currently supports one package per order
   * - Package checksum is revalidated both before and during transaction for anti-tampering and concurrency safety
   * - GHN cancellation is attempted as compensation when post-transaction GHN-linked steps fail
   */
  async create(
    createOrderDto: CreateOrderDto,
  ): Promise<OrdersWithFullInformation> {
    try {
      const startTime = Date.now();
      const ghnShopId = process.env.GHN_SHOP1_ID!;

      // check packages in createOrderDto is not empty
      if (!createOrderDto.packages) {
        this.logger.error('No packages provided in create order request');
        throw new BadRequestException(
          'No packages provided in create order request',
        );
      }

      // check checksum of package in createOrderDto with checksum in database to make sure that package information is not tampered by client
      const secretKeyForCreateChecksum = process.env.PACKAGE_CHECKSUM_SECRET;
      if (!secretKeyForCreateChecksum) {
        this.logger.error(
          'Secret key for creating package checksum is not defined in environment variables.',
        );
        throw new InternalServerErrorException(
          'Server configuration error: missing secret key for creating package checksum.',
        );
      }

      const payloadForCreateChecksum =
        createOrderDto.packages[ghnShopId].PackageDetail;

      const checksumDataAtRealtimeCreateNewOrder = createPackageChecksum(
        payloadForCreateChecksum,
        secretKeyForCreateChecksum,
      );

      const checksumFromDatabase =
        await this.prismaService.packageChecksums.findFirst({
          where: {
            id: BigInt(
              createOrderDto.packages[ghnShopId].checksumInformation
                .checksumIdInDB,
            ),
            userId: BigInt(createOrderDto.userId),
            checksumData:
              createOrderDto.packages[ghnShopId].checksumInformation
                .checksumData,
            isUsed: false,
            expiredAt: { gt: new Date() },
          },
        });

      if (
        !checksumFromDatabase ||
        checksumFromDatabase.checksumData !==
          checksumDataAtRealtimeCreateNewOrder
      ) {
        this.logger.error(
          `Checksum verification failed for package with GHN shop ID ${ghnShopId}. Possible data tampering detected.`,
        );
        throw new BadRequestException(
          `Checksum verification failed for package with GHN shop ID ${ghnShopId}. Possible data tampering detected.`,
        );
      }

      // check again user address with address in database
      // to make sure that address information is not tampered by client
      if (!createOrderDto.shippingAddress) {
        this.logger.error(
          'Shipping address is required for creating an order.',
        );
        throw new BadRequestException(
          'Shipping address is required for creating an order.',
        );
      }

      if (
        createOrderDto.userId !==
          createOrderDto.shippingAddress.orderAddressInDb.userId ||
        createOrderDto.userId !==
          createOrderDto.packages[ghnShopId].PackageDetail.to_user_id ||
        createOrderDto.shippingAddress.orderAddressInDb.userId !==
          createOrderDto.packages[ghnShopId].PackageDetail.to_user_id
      ) {
        this.logger.error(
          'User ID does not match between address, package, user of this create order request.',
        );
        throw new BadRequestException(
          'User ID does not match between address, package, user of this create order request.',
        );
      }

      const addressFromDatabase = await this.prismaService.address.findUnique({
        where: {
          id: BigInt(createOrderDto.shippingAddress.orderAddressInDb.id),
          userId: BigInt(createOrderDto.userId),
        },
      });

      if (!addressFromDatabase) {
        this.logger.error('Invalid shipping address provided.');
        throw new BadRequestException('Invalid shipping address provided.');
      }

      // check again orderAddressInGHN to make sure that address information is not tampered by client
      if (
        createOrderDto.shippingAddress.orderAddressInGHN.toProvince
          .ProvinceID !==
          createOrderDto.packages[ghnShopId].PackageDetail.to_province_id ||
        createOrderDto.shippingAddress.orderAddressInGHN.toDistrict
          .DistrictID !==
          createOrderDto.packages[ghnShopId].PackageDetail.to_district_id ||
        createOrderDto.shippingAddress.orderAddressInGHN.toWard.WardCode !==
          createOrderDto.packages[ghnShopId].PackageDetail.to_ward_code
      ) {
        this.logger.error(
          'Address information in GHN does not match the package details.',
        );
        throw new BadRequestException(
          'Address information in GHN does not match the package details.',
        );
      }

      // only once package in packages for now, we will support multiple packages in one order in the future
      const ghnShopIdList: bigint[] = [];
      for (const ghnShopId in createOrderDto.packages) {
        ghnShopIdList.push(BigInt(ghnShopId));
      }

      if (ghnShopIdList.length > 1) {
        this.logger.error(
          'Now, one package is supported. Please check again pass only one package}',
        );
        throw new BadRequestException(
          'Now, one package is supported. Please check again pass only one package}',
        );
      }

      const processByStaffDefault = null;
      const orderDateDefault = new Date();
      let ghnOrderCode: string = '';
      const ghnConfig = {
        token: process.env.GHN_TOKEN!,
        shopId: Number(ghnShopId),
        host: process.env.GHN_HOST!,
        trackingHost: process.env.GHN_TRACKING_HOST!,
        testMode: process.env.GHN_TEST_MODE === 'true',
      };

      const ghn = new Ghn(ghnConfig);

      const orderStatusDefault: OrderStatus =
        createOrderDto.paymentMethod === PaymentMethod.COD
          ? OrderStatus.PAYMENT_CONFIRMED
          : OrderStatus.PAYMENT_PROCESSING;

      const paymentStatusDefault: PaymentStatus = PaymentStatus.PENDING;
      const shipmentStatusDefault: ShipmentStatus = ShipmentStatus.PENDING;
      const orderItems: PackageItemDetail[] = [];
      const orderItemIdMap = new Map<string, OrderItems>();

      const appliedUserVoucher: UserVoucherDetailInformation | null =
        createOrderDto.packages[ghnShopId].PackageDetail.userVoucher;

      const appliedVouchersOnOrderItemsList: Vouchers[] = [];
      const appliedVouchersOnOrderItemsMap = new Map<string, number>();

      const shippingFee =
        createOrderDto.packages[ghnShopId].PackageDetail.shippingFee;

      const subTotal =
        createOrderDto.packages[ghnShopId].PackageDetail
          .subTotalPriceForPackage;

      const discount =
        createOrderDto.packages[ghnShopId].PackageDetail
          .specialUserDiscountAmountForPackage;

      const totalAmount =
        createOrderDto.packages[ghnShopId].PackageDetail.totalPriceForPackage;

      orderItems.push(
        ...createOrderDto.packages[ghnShopId].PackageDetail.packageItems,
      );

      orderItems.sort(
        (a, b) => Number(a.productVariantId) - Number(b.productVariantId),
      );

      for (const item of orderItems) {
        if (item.appliedVoucher) {
          appliedVouchersOnOrderItemsList.push(item.appliedVoucher);
        }
      }

      appliedVouchersOnOrderItemsList.sort(
        (a, b) => Number(a.id) - Number(b.id),
      );

      appliedVouchersOnOrderItemsList.forEach((voucher) => {
        const count: number =
          appliedVouchersOnOrderItemsMap.get(voucher.id.toString()) || 0;
        appliedVouchersOnOrderItemsMap.set(voucher.id.toString(), count + 1);
      });

      // check duplicate product variant id in packages
      for (let i = 0; i < orderItems.length - 1; i++) {
        for (let j = i + 1; j < orderItems.length; j++) {
          if (
            orderItems[i].productVariantId === orderItems[j].productVariantId
          ) {
            this.logger.error(
              `Duplicate product variant found in order items: ${orderItems[i].productVariantId}`,
            );
            throw new BadRequestException(
              `Duplicate product variant found in order items: ${orderItems[i].productVariantId}`,
            );
          }
        }
      }

      // get user order information for creating order and creating order on GHN
      const userFromDB = await this.prismaService.user.findUnique({
        where: {
          id: BigInt(createOrderDto.userId),
        },
      });

      if (!userFromDB) {
        this.logger.error(`User with ID ${createOrderDto.userId} not found!`);
        throw new NotFoundException(
          `User with ID ${createOrderDto.userId} not found!`,
        );
      }

      try {
        this.logger.log(
          'Starting order creation transaction for user with ID ' +
            createOrderDto.userId,
        );

        const newOrderWithFullInformation: OrdersWithFullInformation =
          await this.prismaService.$transaction(async (tx) => {
            // check again checksum information for this package to make sure
            // that package information is not tampered by client during the transaction
            // because the concurrency issue may happen
            // when multiple create order request with the same package checksum at the same time,
            // we need to check checksum information again in transaction
            // to make sure that only one of the request can create order successfully,
            // the other requests will fail
            // because checksum record will be updated to used after first request create order successfully
            try {
              await tx.packageChecksums.update({
                where: {
                  id: BigInt(
                    createOrderDto.packages[ghnShopId].checksumInformation
                      .checksumIdInDB,
                  ),
                  userId: BigInt(createOrderDto.userId),
                  checksumData:
                    createOrderDto.packages[ghnShopId].checksumInformation
                      .checksumData,
                  isUsed: false,
                  expiredAt: { gt: orderDateDefault },
                },
                data: {
                  isUsed: true,
                },
              });
            } catch (error) {
              this.logger.error(
                `Error occurred while updating checksum for package with GHN shop ID ${ghnShopId}:`,
                error,
              );
              // Re-throw known HTTP exceptions (e.g. NotFoundException) without wrapping them
              if (error instanceof HttpException) throw error;
              throw new BadRequestException(
                `Error occurred while updating checksum for package with GHN shop ID ${ghnShopId}: ${error}`,
              );
            }

            // check stock for each item in orderItems
            // and after that update product and product variant stock quantity
            for (const item of orderItems) {
              try {
                // reduce stock quantity for product variant
                const updateProductVariant = await tx.productVariants.update({
                  where: {
                    id: BigInt(item.productVariantId),
                    stock: { gte: item.quantity },
                  },
                  include: {
                    product: {
                      select: {
                        id: true,
                      },
                    },
                  },
                  data: {
                    stock: {
                      decrement: item.quantity,
                    },
                  },
                });

                if (!updateProductVariant) {
                  this.logger.error(
                    `Failed to update product variant with ID ${item.productVariantId}`,
                  );
                  throw new BadRequestException(
                    `Failed to update product variant with ID ${item.productVariantId}`,
                  );
                }

                // reduce stock quantity for product
                const updateProduct = await tx.products.update({
                  where: {
                    id: updateProductVariant.product.id,
                    stock: { gte: item.quantity },
                  },
                  data: {
                    stock: {
                      decrement: item.quantity,
                    },
                  },
                });

                if (!updateProduct) {
                  this.logger.error(
                    `Failed to update product with ID ${updateProductVariant.product.id}`,
                  );
                  throw new BadRequestException(
                    `Failed to update product with ID ${updateProductVariant.product.id}`,
                  );
                }
              } catch (error) {
                this.logger.error(
                  `Error occurred while updating product or product variant:`,
                  error,
                );
                // Re-throw known HTTP exceptions (e.g. NotFoundException) without wrapping them
                if (error instanceof HttpException) throw error;
                throw new BadRequestException(
                  `Error occurred while updating product or product variant: ${error}`,
                );
              }
            }

            // update voucher quantity in database
            // when creating order if order has voucher
            // to do: update voucher on item-level (appliedVouchersOnOrderItemsList)
            for (const [
              voucherId,
              decrementAmount,
            ] of appliedVouchersOnOrderItemsMap) {
              try {
                const updateVoucher = await tx.vouchers.updateMany({
                  where: {
                    id: Number(voucherId),
                    isActive: true,
                    isOverUsageLimit: false,
                    validFrom: { lte: orderDateDefault },
                    validTo: { gte: orderDateDefault },
                    OR: [
                      { usageLimit: null }, // Trường hợp không giới hạn
                      {
                        usageLimit: {
                          gt:
                            Number(tx.vouchers.fields.timesUsed) +
                            Number(decrementAmount), // Giới hạn phải lớn hơn số lần dùng cho đơn hàng sắp đặt. Nếu không đủ thì báo lỗi để tạo lại đơn hàng.
                        },
                      },
                    ],
                  },
                  data: {
                    timesUsed: {
                      increment: decrementAmount,
                    },
                  },
                });

                if (updateVoucher.count === 0) {
                  this.logger.error(
                    `Failed to update voucher with ID ${voucherId}. It may be inactive, over usage limit for this order.`,
                  );
                  throw new BadRequestException(
                    `Failed to update voucher with ID ${voucherId}. It may be inactive, over usage limit for this order.`,
                  );
                }
              } catch (error) {
                this.logger.error(
                  `Error occurred while updating voucher with ID ${voucherId}: ${error}`,
                );
                // Re-throw known HTTP exceptions (e.g. NotFoundException) without wrapping them
                if (error instanceof HttpException) throw error;
                throw new BadRequestException(
                  `Failed to update voucher with ID ${voucherId}. It may be inactive, over usage limit for this order.`,
                );
              }
            }
            // to do: update user voucher on order-level (appliedUserVoucher)
            if (appliedUserVoucher) {
              try {
                await tx.userVouchers.update({
                  where: {
                    id: appliedUserVoucher.id,
                    voucherStatus: VoucherStatus.SAVED,
                    voucher: {
                      isActive: true,
                      isOverUsageLimit: false,
                      validFrom: { lte: orderDateDefault },
                      validTo: { gte: orderDateDefault },
                      OR: [
                        { usageLimit: null }, // Trường hợp không giới hạn
                        {
                          usageLimit: {
                            gt: tx.vouchers.fields.timesUsed, // Giới hạn phải lớn hơn số lần đã dùng
                          },
                        },
                      ],
                    },
                  },
                  data: {
                    useVoucherAt: orderDateDefault,
                    voucherStatus: VoucherStatus.USED,
                    voucher: {
                      update: {
                        where: {
                          id: appliedUserVoucher.voucherId,
                        },
                        data: {
                          timesUsed: {
                            increment: 1,
                          },
                        },
                      },
                    },
                  },
                  include: {
                    voucher: true,
                  },
                });
              } catch (error) {
                this.logger.error(
                  `Error occurred while updating user voucher: ${error}`,
                );
                // Re-throw known HTTP exceptions (e.g. NotFoundException) without wrapping them
                if (error instanceof HttpException) throw error;
                throw new BadRequestException(
                  `Failed to update user voucher: ${error}`,
                );
              }
            }

            // create new order
            const newOrder = await tx.orders.create({
              data: {
                userId: createOrderDto.userId,
                shippingAddressId:
                  createOrderDto.shippingAddress.orderAddressInDb.id,
                processByStaffId: processByStaffDefault,
                orderDate: orderDateDefault,
                status: orderStatusDefault,
                subTotal: subTotal,
                shippingFee: shippingFee,
                discount: discount,
                totalAmount: totalAmount,
                description: createOrderDto.description,
                packageChecksumsId: checksumFromDatabase.id,
                appliedUserVouchers: appliedUserVoucher
                  ? {
                      connect: {
                        id: appliedUserVoucher.id,
                      },
                    }
                  : undefined,
              },
            });

            if (!newOrder) {
              this.logger.error(
                `Failed to create order for user with ID ${createOrderDto.userId}`,
              );
              throw new BadRequestException(
                `Failed to create order for user with ID ${createOrderDto.userId}`,
              );
            }

            // please create order items after creating order
            for (const item of orderItems) {
              const newOrderItem = await tx.orderItems.create({
                data: {
                  orderId: newOrder.id,
                  productVariantId: BigInt(item.productVariantId),
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  totalPrice: item.totalPrice,
                  discountValue: item.totalDiscountAmount,
                  appliedVoucherId: item.appliedVoucher
                    ? BigInt(item.appliedVoucher.id)
                    : null,
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

              orderItemIdMap.set(
                item.productVariantId.toString(),
                newOrderItem,
              );
            }

            // this is default payment information
            // and this is only one payment record for one order.
            // when payment is paid by vnpay,
            // you can update this transaction id with vnpay transaction id
            // you can update payment status to Paid
            // you need create new shipment and shipment items after payment is successful
            const newPayment = await tx.payments.create({
              data: {
                orderId: newOrder.id,
                transactionId: `${Date.now()}-${newOrder.id}-${createOrderDto.userId}-${Math.floor(
                  Math.random() * 10000000,
                )}`,
                paymentMethod: createOrderDto.paymentMethod,
                amount: newOrder.totalAmount,
                status: paymentStatusDefault,
              },
            });

            if (!newPayment) {
              this.logger.error(
                `Failed to create payment for order with ID ${newOrder.id}`,
              );
              throw new BadRequestException(
                `Failed to create payment for order with ID ${newOrder.id}`,
              );
            }

            // create shipment record in database
            const newShipment = await tx.shipments.create({
              data: {
                orderId: newOrder.id,
                processByStaffId: processByStaffDefault,
                ghnOrderCode: null, // to update after create order on GHN successfully
                estimatedDelivery: dayjs().add(2, 'days').toDate(), // default estimated delivery time is 2 days, to update after create order on GHN successfully
                estimatedShipDate: dayjs().add(1, 'days').toDate(), // default estimated ship date is 1 day, to update after create order on GHN successfully
                carrier: createOrderDto.carrier,
                trackingNumber: `${Date.now()}-${newOrder.id}-${createOrderDto.userId}-${Math.floor(
                  Math.random() * 10000000,
                )}`, // default tracking number, to update after create order on GHN successfully
                status: shipmentStatusDefault,
                description: newOrder.description ? newOrder.description : '',
              },
            });

            if (!newShipment) {
              this.logger.log(
                `Failed to create shipment for order with ID ${newOrder.id}`,
              );
              throw new BadRequestException(
                `Failed to create shipment for order with ID ${newOrder.id}`,
              );
            }

            // create shipment items record in database
            for (const item of createOrderDto.packages[ghnShopId].PackageDetail
              .packageItems) {
              const orderItemId = orderItemIdMap.get(
                item.productVariantId.toString(),
              )?.id;

              if (!orderItemId) {
                this.logger.error(
                  `Failed to find order item ID for product variant with ID ${item.productVariantId}`,
                );
                throw new BadRequestException(
                  `Failed to find order item ID for product variant with ID ${item.productVariantId}`,
                );
              }

              const newShipmentItem = await tx.shipmentItems.create({
                data: {
                  shipmentId: newShipment.id,
                  orderItemId: orderItemId,
                },
              });

              if (!newShipmentItem) {
                this.logger.error(
                  `Failed to create shipment item for order item with product variant ID ${item.productVariantId}`,
                );
                throw new BadRequestException(
                  `Failed to create shipment item for order item with product variant ID ${item.productVariantId}`,
                );
              }
            }

            // Phần này là gọi ra ghn order api để tạo đơn vận chuyển trên GHN
            // sau khi đã tạo xong đơn hàng và các bản ghi liên quan trong database
            // tạo ghn order api ở trong transaction để đảm bảo tính toàn vẹn dữ liệu,
            // nếu tạo đơn trên GHN thất bại thì transaction sẽ bị rollback
            // và đơn hàng sẽ không được tạo trong database

            // về trường hợp nếu đã có đơn hàng được tạo trên GHN
            // nhưng cập nhật mã đơn GHN vào bản ghi shipment trong database thất bại,
            // thì sẽ có việc hủy đơn hàng trên ghn ở phần catch
            // của cụm try catch bao quanh transaction
            // để đảm bảo không có đơn hàng nào bị tạo trên GHN mà không có mã đơn GHN trong database cả

            this.logger.log(
              'Attempting to create order on GHN with order ID ' + newOrder.id,
            );

            let contentForGhnOrder = '';
            for (const item of createOrderDto.packages[ghnShopId].PackageDetail
              .packageItems) {
              contentForGhnOrder += `${item.productVariantName} - SKU: ${item.productVariantSKU} - Size: ${item.productVariantSize} - Color: ${item.productVariantColor} - Quantity: ${item.quantity} - Unit Price: ${item.unitPrice} ${item.currencyUnit}\n`;
            }

            let totalAmountForGHNOrder = newOrder.totalAmount;

            // default (COD payment method) -> total amount for ghn shipment is the total amount of the order.
            // if the order has any non-COD payment method, set total amount for GHN shipment to 0 to avoid collect money from customer when delivery
            if (createOrderDto.paymentMethod === PaymentMethod.VNPAY) {
              totalAmountForGHNOrder = 0;
            } else if (createOrderDto.paymentMethod === PaymentMethod.COD) {
              totalAmountForGHNOrder = newOrder.totalAmount;
            }

            const ghnCreateNewOrderRequest = await ghn.order.createOrder({
              from_address:
                createOrderDto.packages[ghnShopId].PackageDetail.ghnShopDetail
                  .address,
              from_name:
                createOrderDto.packages[ghnShopId].PackageDetail.ghnShopDetail
                  .name,
              from_phone:
                createOrderDto.packages[ghnShopId].PackageDetail.ghnShopDetail
                  .phone,
              from_province_name:
                createOrderDto.packages[ghnShopId].PackageDetail
                  .ghnProvinceName,
              from_district_name:
                createOrderDto.packages[ghnShopId].PackageDetail
                  .ghnDistrictName,
              from_ward_name:
                createOrderDto.packages[ghnShopId].PackageDetail.ghnWardName,

              payment_type_id: 2, // 1: seller pay, 2: buyer pay
              note: newOrder.description ? newOrder.description : undefined,
              required_note:
                'KHONGCHOXEMHANG' /**Note shipping order.Allowed values: CHOTHUHANG, CHOXEMHANGKHONGTHU, KHONGCHOXEMHANG. CHOTHUHANG mean Buyer can request to see and trial goods. CHOXEMHANGKHONGTHU mean Buyer can see goods but not allow to trial goods. KHONGCHOXEMHANG mean Buyer not allow to see goods */,
              return_phone:
                createOrderDto.packages[ghnShopId].PackageDetail.ghnShopDetail
                  .phone,
              return_address:
                createOrderDto.packages[ghnShopId].PackageDetail.ghnShopDetail
                  .address,
              return_district_id:
                createOrderDto.packages[ghnShopId].PackageDetail
                  .from_district_id,
              return_ward_code:
                createOrderDto.packages[ghnShopId].PackageDetail.from_ward_code,
              client_order_code: null,
              to_name: userFromDB.firstName + ' ' + userFromDB.lastName,
              to_phone: createOrderDto.phone,
              to_address:
                createOrderDto.shippingAddress.orderAddressInDb.street +
                ' ' +
                createOrderDto.shippingAddress.orderAddressInDb.ward +
                ' ' +
                createOrderDto.shippingAddress.orderAddressInDb.district +
                ' ' +
                createOrderDto.shippingAddress.orderAddressInDb.province +
                ' ' +
                createOrderDto.shippingAddress.orderAddressInDb.country,
              to_ward_code:
                createOrderDto.packages[ghnShopId].PackageDetail.to_ward_code,
              to_district_id:
                createOrderDto.packages[ghnShopId].PackageDetail.to_district_id,
              cod_amount: totalAmountForGHNOrder,
              content: contentForGhnOrder,
              weight:
                createOrderDto.packages[ghnShopId].PackageDetail.totalWeight,
              length:
                createOrderDto.packages[ghnShopId].PackageDetail.maxLength,
              width: createOrderDto.packages[ghnShopId].PackageDetail.maxWidth,
              height:
                createOrderDto.packages[ghnShopId].PackageDetail.totalHeight,
              pick_station_id: undefined,
              insurance_value:
                newOrder.totalAmount < 5000000 ? newOrder.totalAmount : 5000000,
              service_id:
                createOrderDto.packages[ghnShopId].PackageDetail.shippingService
                  .service_id,
              service_type_id:
                createOrderDto.packages[ghnShopId].PackageDetail.shippingService
                  .service_type_id,
              coupon: null,
              pick_shift: undefined,
              items:
                createOrderDto.packages[ghnShopId].PackageDetail
                  .packageItemsForGHNCreateNewOrderRequest,
            });

            if (!ghnCreateNewOrderRequest) {
              this.logger.error(
                `Failed to create order on GHN for shop office with GHN shop ID ${ghnShopId}`,
              );
              throw new BadRequestException(
                `Failed to create order on GHN for shop office with GHN shop ID ${ghnShopId}`,
              );
            }

            this.logger.log(
              `Successfully created order on GHN with GHN order code ${ghnCreateNewOrderRequest.order_code} for shop office with GHN shop ID ${ghnShopId}`,
            );

            ghnOrderCode = ghnCreateNewOrderRequest.order_code;
            // update ghn order code and estimated delivery date for shipment record in database
            // shipment record is must be one record for one order because we only support one package for one order now

            this.logger.log(
              'Attempting to update shipment record in database with GHN order code and estimated delivery date for order with ID ' +
                newOrder.id,
            );

            const updatedShipment = await tx.shipments.update({
              where: {
                id: newShipment.id, // shipment record is must be one record for one order because we only support one package for one order now
              },
              data: {
                ghnOrderCode: ghnCreateNewOrderRequest.order_code,
                estimatedDelivery:
                  ghnCreateNewOrderRequest.expected_delivery_time,
                trackingNumber: ghnCreateNewOrderRequest.order_code,
              },
            });

            if (!updatedShipment) {
              this.logger.error(
                `Failed to update shipment with GHN order code for order with ID ${newOrder.id}`,
              );
              throw new BadRequestException(
                `Failed to update shipment with GHN order code for order with ID ${newOrder.id}`,
              );
            }

            this.logger.log(
              'Successfully updated shipment record in database with GHN order code for order with ID ' +
                newOrder.id,
            );

            this.logger.log(
              `Successfully created order, order items, payment, shipment, shipment items and ghn shipment for order with ID ${newOrder.id}`,
            );

            const newOrderWithFullInformation: OrdersWithFullInformation | null =
              await tx.orders.findFirst({
                where: { id: newOrder.id },
                include: OrdersWithFullInformationInclude,
              });

            if (!newOrderWithFullInformation) {
              this.logger.error(
                `Failed to retrieve order with ID ${newOrder.id} after creation`,
              );
              throw new BadRequestException(
                `Failed to retrieve order with ID ${newOrder.id} after creation`,
              );
            }

            return newOrderWithFullInformation;
          });

        this.logger.log(
          `Order creation transaction completed in ${
            (Date.now() - startTime) / 1000
          } seconds for user with ID ${createOrderDto.userId}`,
        );

        // return order information with full information after creating order successfully

        const returnOrderWithFullInformation =
          formatMediaFieldWithLoggingForOrders(
            [newOrderWithFullInformation],
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            this.logger,
          )[0];

        const endTime = Date.now();
        this.logger.log(
          `Order created with ID: ${returnOrderWithFullInformation.id}`,
        );
        this.logger.log(
          `Time for creating order with ID ${returnOrderWithFullInformation.id}: ${endTime - startTime} ms`,
        );
        return returnOrderWithFullInformation;
      } catch (error) {
        this.logger.error(
          'Error occurred during order creation transaction: ',
          error,
        );
        if (ghnOrderCode) {
          // please create api to cancel order on GHN
          // when create order on GHN successfully
          // but failed in create order transaction
          // to avoid having orphan order on GHN without order in our database
          this.logger.log(
            `Attempting to cancel GHN order with order code ${ghnOrderCode} due to failure in order creation transaction`,
          );
          const cancelOrder = await ghn.order.cancelOrder({
            orderCodes: [ghnOrderCode],
          });

          if (!cancelOrder) {
            this.logger.error(
              `Failed to cancel GHN order with order code ${ghnOrderCode} after order creation transaction failed`,
            );
          }
          this.logger.log(
            `Successfully cancelled GHN order with order code ${ghnOrderCode} after order creation transaction failed`,
          );
        }
        // Re-throw known HTTP exceptions (e.g. NotFoundException) without wrapping them
        if (error instanceof HttpException) throw error;
        throw new BadRequestException('Failed to create order');
      }
    } catch (error) {
      this.logger.error('Failed to create order: ', error);
      // Re-throw known HTTP exceptions (e.g. NotFoundException) without wrapping them
      if (error instanceof HttpException) throw error;
      throw new BadRequestException('Failed to create order');
    }
  }

  /**
   * Retrieves a paginated list of all orders with full information.
   *
   * This method performs the following operations:
   * 1. Fetches orders from the database with pagination
   * 2. Includes all related information (address, items, payments, shipments)
   * 3. Formats media URLs for all related entities
   * 4. Logs the fetch operation
   *
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of orders to retrieve per page
   *
   * @returns {Promise<OrdersWithFullInformation[] | []>} Array of orders with full information including:
   *   - Order details (id, status, dates, amounts)
   *   - Shipping address
   *   - Order items
   *   - Payment information
   *   - Shipment details
   *   - Formatted media URLs
   *   Returns empty array if no orders found
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by order ID in ascending order
   * - Media URLs are converted to public HTTPS URLs
   * - Empty array is returned instead of null when no results found
   */
  async findAll(
    page: number,
    perPage: number,
  ): Promise<OrdersWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrdersWithFullInformation,
        Prisma.OrdersFindManyArgs
      >(
        this.prismaService.orders,
        {
          include: OrdersWithFullInformationInclude,
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      result.data = formatMediaFieldWithLoggingForOrders(
        result.data,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      this.logger.log(
        `Fetched page ${page} of orders with ${perPage} orders per page.`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all orders: ', error);
      throw new BadRequestException('Failed to fetch all orders');
    }
  }

  /**
   * Retrieves a single order by ID with all associated information.
   *
   * This method performs the following operations:
   * 1. Queries the database for the order by ID
   * 2. Includes all related information (address, items, payments, shipments)
   * 3. Formats media URLs for all related entities
   * 4. Logs the fetch operation
   *
   * @param {number} id - The unique identifier of the order to retrieve
   *
   * @returns {Promise<OrdersWithFullInformation | null>} The order with full information including:
   *   - Order details (id, status, dates, amounts)
   *   - Shipping address
   *   - Order items
   *   - Payment information
   *   - Shipment details
   *   - Formatted media URLs
   *   Returns null if order not found
   *
   * @throws {NotFoundException} If order is not found
   * @throws {BadRequestException} If data fetching or formatting fails
   *
   * @remarks
   * - Media URLs are converted to public HTTPS URLs
   * - Throws error if formatting fails after successful fetch
   */
  async findOne(id: number): Promise<OrdersWithFullInformation | null> {
    try {
      const result = await this.prismaService.orders.findFirst({
        where: { id: id },
        include: OrdersWithFullInformationInclude,
      });

      if (!result) {
        throw new NotFoundException('Order not found!');
      }

      const returnResult = formatMediaFieldWithLoggingForOrders(
        [result],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      if (!returnResult) {
        throw new NotFoundException('Order error after formatting media!');
      }

      this.logger.log(`Fetched order with ID: ${id}`);
      return returnResult;
    } catch (error) {
      this.logger.error(`Failed to fetch order with ID ${id}: `, error);
      throw new BadRequestException('Failed to fetch order');
    }
  }

  /**
   * Retrieves available GHN pickup shifts for the configured GHN shop.
   *
   * This method performs the following operations:
   * 1. Loads GHN configuration from environment variables
   * 2. Initializes the GHN client
   * 3. Calls GHN `pickShift` API to fetch available pickup shifts
   * 4. Validates that GHN returns a shift payload
   * 5. Logs the returned shift data for tracing
   *
   * @returns {Promise<MyPickShiftResponse[]>} GHN pickup shift response returned by the SDK
   *
   * @throws {BadRequestException} If GHN returns no shift or the request fails
   *
   * @remarks
   * - Used by the order pickup flow before assigning a shipment to WAITING_FOR_PICKUP
   * - The returned payload is passed back to callers for user selection or further processing
   */
  async pickShiftOnGHNSystem(): Promise<MyPickShiftResponse[]> {
    try {
      const ghnShopId = process.env.GHN_SHOP1_ID!;
      const ghnConfig = {
        token: process.env.GHN_TOKEN!,
        shopId: Number(ghnShopId),
        host: process.env.GHN_HOST!,
        trackingHost: process.env.GHN_TRACKING_HOST!,
        testMode: process.env.GHN_TEST_MODE === 'true',
      };

      const ghn = new Ghn(ghnConfig);
      const shift = await ghn.order.pickShift({});

      if (!shift) {
        this.logger.error(
          `Failed to pick shift on GHN system: No shift returned`,
        );
        throw new BadRequestException('Failed to pick shift on GHN system');
      }

      this.logger.log(
        `Successfully picked shift on GHN system: ${JSON.stringify(shift)}`,
      );
      return shift;
    } catch (error) {
      this.logger.error(`Failed to pick shift on GHN system: `, error);
      throw new BadRequestException('Failed to pick shift on GHN system');
    }
  }

  /**
   * Updates an order from `PAYMENT_CONFIRMED` to `WAITING_FOR_PICKUP` and synchronizes GHN pickup shift.
   *
   * This method performs the following operations:
   * 1. Initializes GHN shop client from environment configuration
   * 2. Validates that the order exists
   * 3. Validates current order status is `PAYMENT_CONFIRMED`
   * 4. Finds the pending shipment of the order that already has a GHN order code
   * 5. Calls GHN update-order API to assign selected pickup shift
   * 6. In a database transaction:
   *    - Creates a `GhnPickShift` tracking record
   *    - Updates shipment to `WAITING_FOR_PICKUP` and links created pick-shift record
   *    - Updates order to `WAITING_FOR_PICKUP`
   * 7. Formats media URLs for nested response entities
   * 8. Logs successful update result
   *
   * @param {number} id - The unique identifier of the order to update
   * @param {UpdateOrderDto} updateOrderDto - Update payload containing staff and GHN pick-shift fields:
   *   - `processByStaffId`: staff who processes this transition
   *   - `ghnPickShiftId`: GHN shift ID selected for pickup
   *   - `ghnTitle`, `ghnFromTime`, `ghnToTime`: GHN shift metadata stored for auditing
   *
   * @returns {Promise<OrdersWithFullInformation>} Updated order with full relationships and formatted media URLs
   *
   * @throws {NotFoundException} If order is not found or formatted result is unexpectedly empty
   * @throws {BadRequestException} If:
   *   - Order status is not eligible for transition
   *   - Pending shipment with GHN order code is not found
   *   - GHN update-order call fails
   *   - Database transaction fails
   *
   * @remarks
   * - Current flow assumes one shipment per order (uses `findFirst` shipment lookup)
   * - Shipment transition is restricted to `PENDING` -> `WAITING_FOR_PICKUP`
   * - Order transition is restricted to `PAYMENT_CONFIRMED` -> `WAITING_FOR_PICKUP`
   */
  async updateOrderToWaitingPickup(
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrdersWithFullInformation> {
    try {
      // call ghn to update pick shift for ghn shipment when update order status to WAITING_FOR_PICKUP
      const ghnShopId = process.env.GHN_SHOP1_ID!;
      const ghnConfig = {
        token: process.env.GHN_TOKEN!,
        shopId: Number(ghnShopId),
        host: process.env.GHN_HOST!,
        trackingHost: process.env.GHN_TRACKING_HOST!,
        testMode: process.env.GHN_TEST_MODE === 'true',
      };

      const ghnShop = new GHNShops(ghnConfig);
      // find first because we only support one shipment for one order now,
      // and shipment record must be created when create order
      // only update shipment when shipment status is Pending if not the behavior is forbiden

      const orderFromDB = await this.prismaService.orders.findFirst({
        where: {
          id: id,
        },
      });

      if (!orderFromDB) {
        this.logger.error(`Order with ID ${id} not found for update`);
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      if (orderFromDB.status !== OrderStatus.PAYMENT_CONFIRMED) {
        this.logger.error(
          `Order with ID ${id} has invalid status ${orderFromDB.status} for update to WAITING_FOR_PICKUP. Only orders with status PAYMENT_CONFIRMED can be updated to WAITING_FOR_PICKUP.`,
        );
        throw new BadRequestException(
          `Order with ID ${id} has invalid status ${orderFromDB.status} for update to WAITING_FOR_PICKUP. Only orders with status PAYMENT_CONFIRMED can be updated to WAITING_FOR_PICKUP.`,
        );
      }

      const shipmentInformation = await this.prismaService.shipments.findFirst({
        where: {
          orderId: id,
          ghnOrderCode: {
            not: null,
          },
          status: ShipmentStatus.PENDING,
        },
      });

      if (!shipmentInformation || !shipmentInformation.ghnOrderCode) {
        this.logger.error(
          `No shipment with GHN order code found for order with ID ${id}`,
        );
        throw new BadRequestException(
          `No shipment with GHN order code found for order with ID ${id}`,
        );
      }

      const updateOrderOnGHNSystem = await ghnShop.updateOrder(
        shipmentInformation.ghnOrderCode,
        [Number(updateOrderDto.ghnPickShiftId)],
      );

      if (!updateOrderOnGHNSystem) {
        this.logger.error(
          `Failed to update order on GHN system for order with ID ${id}`,
        );
        throw new BadRequestException(
          `Failed to update order on GHN system for order with ID ${id}`,
        );
      }

      const result: OrdersWithFullInformation =
        await this.prismaService.$transaction(async (tx) => {
          // create new ghnPickShift record in database for tracking pick shift information on GHN system
          const newGHNPickShift = await tx.ghnPickShift.create({
            data: {
              ghnShiftId: updateOrderDto.ghnPickShiftId,
              ghnTitle: updateOrderDto.ghnTitle,
              ghnFromTime: updateOrderDto.ghnFromTime,
              ghnToTime: updateOrderDto.ghnToTime,
            },
          });

          // update ghnPickShiftId for shipment record in database
          await tx.shipments.update({
            where: {
              id: shipmentInformation.id,
            },
            data: {
              ghnPickShiftId: newGHNPickShift.id,
              status: ShipmentStatus.WAITING_FOR_PICKUP,
              processByStaffId: updateOrderDto.processByStaffId,
            },
          });

          // update order status to WAITING_FOR_PICKUP when update pick shift successfully on GHN system
          const result: OrdersWithFullInformation = await tx.orders.update({
            where: { id: id },
            data: {
              status: OrderStatus.WAITING_FOR_PICKUP,
              processByStaffId: updateOrderDto.processByStaffId,
            },
            include: OrdersWithFullInformationInclude,
          });

          return result;
        });

      const returnResult = formatMediaFieldWithLoggingForOrders(
        [result],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      if (!returnResult) {
        throw new NotFoundException('Order error after formatting media!');
      }

      this.logger.log(`Updated order with ID: ${id}`);
      return returnResult;
    } catch (error) {
      this.logger.error(`Failed to update order with ID ${id}: `, error);
      throw new BadRequestException('Failed to update order');
    }
  }

  /**
   * Updates an order from `WAITING_FOR_PICKUP` to `SHIPPED` after pickup confirmation.
   *
   * This method performs the following operations:
   * 1. Validates that the target order exists
   * 2. Validates current order status is `WAITING_FOR_PICKUP`
   * 3. Starts a database transaction to keep shipment/order updates consistent
   * 4. Finds shipment of the order with status `WAITING_FOR_PICKUP` and non-null GHN order code
   * 5. Updates shipment status to `SHIPPED`, sets `shippedAt`, and updates processing staff
   * 6. Updates order status to `SHIPPED` and updates processing staff
   * 7. Formats media URLs in nested order relations before returning response
   *
   * @param {number} orderId - The unique identifier of the order to transition
   * @param {UpdateOrderFromWaitingForPickupToShippedDto} updateOrderFromWaitingForPickupToShippedDto -
   * Payload containing `processByStaffId` used for audit and ownership tracking
   *
   * @returns {Promise<OrdersWithFullInformation>} Updated order with full related information and formatted media
   *
   * @throws {NotFoundException} If order or eligible shipment is not found, or media formatting yields empty result
   * @throws {BadRequestException} If order has invalid status for this transition or update flow fails
   *
   * @remarks
   * - Transition rule enforced: `WAITING_FOR_PICKUP` -> `SHIPPED`
   * - Shipment selection requires both `ShipmentStatus.WAITING_FOR_PICKUP` and non-null `ghnOrderCode`
   * - Shipment and order are updated in one transaction for database consistency
   */

  async updateOrderFromWaitingPickupToShipped(
    orderId: number,
    updateOrderFromWaitingForPickupToShippedDto: UpdateOrderFromWaitingForPickupToShippedDto,
  ): Promise<OrdersWithFullInformation> {
    try {
      const orderFromDB = await this.prismaService.orders.findFirst({
        where: {
          id: orderId,
        },
      });

      if (!orderFromDB) {
        this.logger.error(`Order with ID ${orderId} not found for update`);
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      if (orderFromDB.status !== OrderStatus.WAITING_FOR_PICKUP) {
        this.logger.error(
          `Order with ID ${orderId} has invalid status ${orderFromDB.status} for update to SHIPPED. Only orders with status WAITING_FOR_PICKUP can be updated to SHIPPED.`,
        );
        throw new BadRequestException(
          `Order with ID ${orderId} has invalid status ${orderFromDB.status} for update to SHIPPED. Only orders with status WAITING_FOR_PICKUP can be updated to SHIPPED.`,
        );
      }

      const result = await this.prismaService.$transaction(async (tx) => {
        // update shipment status to SHIPPED when order is picked up by shipper successfully
        const shipmentInformation = await tx.shipments.findFirst({
          where: {
            orderId: orderId,
            status: ShipmentStatus.WAITING_FOR_PICKUP,
            ghnOrderCode: {
              not: null,
            },
          },
        });

        if (!shipmentInformation) {
          this.logger.error(
            `Shipment not found for order with ID ${orderId} when updating order status to SHIPPED`,
          );
          throw new NotFoundException(
            `Shipment not found for order with ID ${orderId} when updating order status to SHIPPED`,
          );
        }

        await tx.shipments.update({
          where: {
            id: shipmentInformation.id,
          },
          data: {
            status: ShipmentStatus.SHIPPED,
            shippedAt: new Date(),
            processByStaffId:
              updateOrderFromWaitingForPickupToShippedDto.processByStaffId,
          },
        });

        // update order status to SHIPPED
        const result = await tx.orders.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.SHIPPED,
            processByStaffId:
              updateOrderFromWaitingForPickupToShippedDto.processByStaffId,
          },
          include: OrdersWithFullInformationInclude,
        });
        return result;
      });

      const returnResult = formatMediaFieldWithLoggingForOrders(
        [result],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      if (!returnResult) {
        throw new NotFoundException('Order error after formatting media!');
      }

      return returnResult;
    } catch (error) {
      this.logger.error(
        `Failed to update order from WAITING_FOR_PICKUP to SHIPPED: `,
        error,
      );
      throw new BadRequestException(
        'Failed to update order from WAITING_FOR_PICKUP to SHIPPED',
      );
    }
  }

  /**
   * Deletes an order and all its associated data from the database.
   *
   * This method performs the following operations:
   * 1. Validates the order ID exists
   * 2. Deletes the order and cascading related records
   * 3. Logs the deletion operation
   *
   * @param {number} id - The unique identifier of the order to delete
   *
   * @returns {Promise<Orders>} The deleted order record
   *
   * @throws {BadRequestException} If order deletion fails or order not found
   *
   * @remarks
   * - This operation is cascading and will delete related records
   * - Verify before deletion as this action cannot be easily reversed
   * - Use with caution in production environments
   */
  async remove(id: number): Promise<Orders> {
    try {
      this.logger.log(`Deleting order with ID: ${id}`);
      return await this.prismaService.orders.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error(`Failed to delete order with ID ${id}: `, error);
      throw new BadRequestException('Failed to delete order');
    }
  }

  /**
   * Cancels an existing order with full rollback of associated resources and GHN synchronization.
   *
   * This method performs the following operations:
   * 1. Validates order existence and cancellation eligibility (shipment status, order status)
   * 2. Validates GHN order code availability for synchronization
   * 3. Rolls back all business operations in a transaction:
   *    - Marks package checksum as unused
   *    - Restores stock for all product variants and products
   *    - Decrements voucher usage counts (item-level vouchers)
   *    - Restores user voucher status from USED to SAVED (order-level voucher)
   * 4. Updates order, shipment, and payment statuses to CANCELLED
   * 5. Cancels corresponding GHN shipment order
   * 6. Returns the cancelled order with full related information
   *
   * @param {number} id - The unique identifier of the order to cancel
   *
   * @returns {Promise<OrdersWithFullInformation>} The cancelled order with full information including:
   *   - Order details with status set to CANCELLED
   *   - Shipping address
   *   - Order items with voucher information restored
   *   - Payment records with status set to CANCELLED
   *   - Shipment details with status set to CANCELLED and GHN code preserved
   *   - All media formatted with public HTTPS URLs
   *
   * @throws {NotFoundException} If order with given ID is not found
   * @throws {BadRequestException} If:
   *   - Order has no associated shipments
   *   - Shipment has no GHN order code
   *   - Order/shipment already cancelled
   *   - Order is in WAITING_FOR_PICKUP status (too late to cancel)
   *   - GHN cancellation fails
   *   - Any database rollback operation fails
   *
   * @remarks
   * - Order must have at least one shipment with valid GHN order code to cancel
   * - Order cannot be cancelled if already in WAITING_FOR_PICKUP or later status
   * - All rollback operations execute within a single transaction for data consistency
   * - If GHN cancellation fails, entire transaction is rolled back
   * - Stock restoration uses increment; voucher restoration uses decrement
   * - Item-level voucher counts are reconstructed and decremented by the same amounts used during creation
   * - User voucher status transition: USED → SAVED with useVoucherAt set to null
   * - GHN shipment order is cancelled to prevent orphaned orders in GHN system
   * - Media URLs are converted to public HTTPS URLs in the response
   */
  async cancelOrder(
    id: number,
    /* clientIp: string,*/
  ): Promise<OrdersWithFullInformation> {
    try {
      const cancelOrder = await this.prismaService.orders.findFirst({
        where: { id: id },
        include: OrdersWithFullInformationInclude,
      });

      if (!cancelOrder) {
        this.logger.error(`Order with ID ${id} not found!`);
        throw new NotFoundException(`Order with ID ${id} not found!`);
      }

      if (cancelOrder.shipments.length === 0) {
        this.logger.error(`Order with ID ${id} has no shipment to cancel!`);
        throw new BadRequestException(
          `Order with ID ${id} has no shipment to cancel!`,
        );
      }

      if (!cancelOrder.shipments[0].ghnOrderCode) {
        this.logger.error(
          `Order with ID ${id} has no GHN order code to cancel!`,
        );
        throw new BadRequestException(
          `Order with ID ${id} has no GHN order code to cancel!`,
        );
      }

      if (cancelOrder.shipments[0].status === ShipmentStatus.CANCELLED) {
        this.logger.error(`Order with ID ${id} has already been cancelled!`);
        throw new BadRequestException(
          `Order with ID ${id} has already been cancelled!`,
        );
      }

      if (cancelOrder.status === OrderStatus.WAITING_FOR_PICKUP) {
        this.logger.error(
          `Order with ID ${id} is waiting for pickup, cannot be cancelled!`,
        );
        throw new BadRequestException(
          `Order with ID ${id} is waiting for pickup, cannot be cancelled!`,
        );
      }

      const ghnShopId = process.env.GHN_SHOP1_ID!;
      const ghnConfig = {
        token: process.env.GHN_TOKEN!,
        shopId: Number(ghnShopId),
        host: process.env.GHN_HOST!,
        trackingHost: process.env.GHN_TRACKING_HOST!,
        testMode: process.env.GHN_TEST_MODE === 'true',
      };

      const ghn = new Ghn(ghnConfig);

      const cancelledOrderWithFullInformation: OrdersWithFullInformation =
        await this.prismaService.$transaction(async (tx) => {
          this.logger.log(
            `Starting cancellation transaction for order with ID ${id}`,
          );

          // rollback checksum of package when cancel order
          this.logger.log(
            `Rolling back package checksum for order with ID ${id} if exists`,
          );
          if (cancelOrder.packageChecksumsId) {
            await tx.packageChecksums.update({
              where: { id: cancelOrder.packageChecksumsId },
              data: {
                isUsed: false,
              },
            });
          }

          this.logger.log('Rolling back package checksum successfully');
          this.logger.log(
            'Rolling back stock for product variants and products for order with ID ' +
              id,
          );

          // rollback stock of product variants and product when cancel order
          for (const item of cancelOrder.orderItems) {
            const updateProductVariant = await tx.productVariants.update({
              where: {
                id: item.productVariantId,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });

            await tx.products.update({
              where: {
                id: updateProductVariant.productId,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }

          this.logger.log('Rolling back stock successfully');
          this.logger.log('Rolling back voucher usage for order with ID ' + id);

          // rollback voucher quantity when cancel order (voucher on item-level)
          for (const item of cancelOrder.orderItems) {
            if (item.appliedVoucherId) {
              await tx.vouchers.update({
                where: {
                  id: BigInt(item.appliedVoucherId),
                },
                data: {
                  timesUsed: {
                    decrement: 1,
                  },
                },
              });
            }
          }

          if (cancelOrder.appliedUserVouchers.length > 0) {
            for (const userVoucher of cancelOrder.appliedUserVouchers) {
              await tx.userVouchers.update({
                where: {
                  id: userVoucher.id,
                },
                data: {
                  voucherStatus: VoucherStatus.SAVED,
                  useVoucherAt: null,
                  voucher: {
                    update: {
                      where: {
                        id: userVoucher.voucherId,
                      },
                      data: {
                        timesUsed: {
                          decrement: 1,
                        },
                      },
                    },
                  },
                },
              });
            }
          }

          this.logger.log('Rolling back voucher usage successfully');

          this.logger.log('Rolling back order status for order with ID ' + id);
          // rollback order status to cancelled
          await tx.orders.update({
            where: {
              id: id,
            },
            data: {
              status: OrderStatus.CANCELLED,
            },
          });

          this.logger.log(
            'Rolling back shipment status for order with ID ' + id,
          );
          // rollback shipment status to cancelled
          await tx.shipments.updateMany({
            where: {
              orderId: id,
            },
            data: {
              status: ShipmentStatus.CANCELLED,
            },
          });

          this.logger.log(
            'Rolling back payment status for order with ID ' + id,
          );
          // rollback payment status to cancelled
          await tx.payments.updateMany({
            where: {
              orderId: id,
            },
            data: {
              status: PaymentStatus.CANCELLED,
            },
          });

          // create refund when cancel order if payment method is VNPAY and payment status is Paid
          if (cancelOrder.payment[0].paymentMethod === PaymentMethod.VNPAY) {
            if (cancelOrder.payment[0].status === PaymentStatus.PAID) {
              this.logger.log(
                `Creating refund request for order with ID ${cancelOrder.id} after cancellation since payment method is VNPAY and payment status is Paid`,
              );

              const newRequest = await tx.requests.create({
                data: {
                  userId: cancelOrder.userId,
                  processByStaffId: null,
                  orderId: cancelOrder.id,
                  subject: RequestType.RETURN_REQUEST,
                  description: `Refund request for order ID ${cancelOrder.id} after cancellation`,
                  status: RequestStatus.APPROVED,
                },
              });

              if (!newRequest) {
                this.logger.error(
                  `Failed to create request for order with ID ${cancelOrder.id} after cancellation`,
                );
                throw new BadRequestException(
                  `Failed to create request for order with ID ${cancelOrder.id} after cancellation`,
                );
              }

              const newReturnRequest = await tx.returnRequests.create({
                data: {
                  requestId: newRequest.id,
                },
              });

              if (!newReturnRequest) {
                this.logger.error(
                  `Failed to create return request for order with ID ${cancelOrder.id} after cancellation`,
                );
                throw new BadRequestException(
                  `Failed to create return request for order with ID ${cancelOrder.id} after cancellation`,
                );
              }

              this.logger.log(
                `Successfully created return request with ID ${newReturnRequest.id} for order with ID ${cancelOrder.id} after cancellation`,
              );

              /*
              this.logger.log(
                `Calling VNPAY API to refund money to customer for order with ID ${cancelOrder.id} after cancellation`,
              );

              // call vnpay to refund money to customer
              // when customer cancel order that order create before
              // by VNPAY payment method and payment status is Paid
              const vnpayRefundInputData: VnpayRefundDto = {
                data: {
                  vnp_TmnCode: process.env.VNPAY_TMN_CODE!,
                  vnp_RequestId: String(newReturnRequest.id),
                  vnp_TxnRef: String(cancelOrder.id),
                  vnp_Amount: Number(cancelOrder.totalAmount),
                  vnp_TransactionNo: String(
                    cancelOrder.payment[0].transactionId,
                  ),
                  vnp_TransactionDate: Number(
                    dayjs(cancelOrder.payment[0].paymentDate).format(
                      'YYYYMMDDHHmmss',
                    ),
                  ),
                  vnp_IpAddr: clientIp,
                  // VNPay expects refund transaction type: 02 (full) or 03 (partial)
                  vnp_TransactionType: '02',
                  vnp_CreateDate: Number(dayjs().format('YYYYMMDDHHmmss')),
                  // Keep ASCII-only creator name to avoid encoding inconsistencies in signature string.
                  vnp_CreateBy: 'SYSTEM',
                  vnp_OrderInfo: `Customer create new return request because customer cancel order with order id: ${cancelOrder.id}`,
                },
                options: {
                  withHash: true,
                  logger: {
                    type: 'all' as const,
                  },
                },
              };

              this.logger.log(
                '[cancelOrder][VNPayRefund] Refund request payload (pre-sign). It input when i send to refund function in @nestjs/vnpay - lehuygiang: ' +
                  JSON.stringify(vnpayRefundInputData.data),
              );

              const vnpayRefundResponse =
                await this.paymentsService.VNPayRefund(vnpayRefundInputData);

              if (!vnpayRefundResponse) {
                this.logger.error(
                  `Failed to refund money to customer for order with ID ${cancelOrder.id} after cancellation`,
                );
                throw new BadRequestException(
                  `Failed to refund money to customer for order with ID ${cancelOrder.id} after cancellation`,
                );
              }

              // fix here for limit function on vnpay (now vnpay is limit refund function)
              // this is primary reason for vnp_ResponseCode = 99 at dev environment

              if (
                vnpayRefundResponse.isSuccess &&
                vnpayRefundResponse.isVerified
              ) {
                this.logger.log(
                  `Successfully refunded money to customer for order with ID ${cancelOrder.id} after cancellation`,
                );
              } else {
                this.logger.error(
                  `Failed to refund money to customer for order with ID ${cancelOrder.id} after cancellation`,
                );
                throw new BadRequestException(
                  `Failed to refund money to customer for order with ID ${cancelOrder.id} after cancellation`,
                );
              } 
              */
            }
          }

          // call GHN API to cancel order on GHN
          if (cancelOrder.shipments[0].ghnOrderCode) {
            this.logger.log(
              `Attempting to cancel GHN order with order code ${cancelOrder.shipments[0].ghnOrderCode}`,
            );
            const cancelGHNOrder = await ghn.order.cancelOrder({
              orderCodes: [cancelOrder.shipments[0].ghnOrderCode],
            });

            if (!cancelGHNOrder) {
              this.logger.error(
                `Failed to cancel GHN order with order code ${cancelOrder.shipments[0].ghnOrderCode}`,
              );
              throw new BadRequestException(
                `Failed to cancel GHN order with order code ${cancelOrder.shipments[0].ghnOrderCode}`,
              );
            }

            this.logger.log(
              `Successfully cancelled GHN order with order code ${cancelOrder.shipments[0].ghnOrderCode}`,
            );
          }

          const cancelledOrderWithFullInformation: OrdersWithFullInformation | null =
            await tx.orders.findFirst({
              where: { id: id },
              include: OrdersWithFullInformationInclude,
            });
          if (!cancelledOrderWithFullInformation) {
            this.logger.error(
              `Failed to retrieve cancelled order with ID ${id} after cancellation`,
            );
            throw new BadRequestException(
              `Failed to retrieve cancelled order with ID ${id} after cancellation`,
            );
          }

          const returnCancelledOrderWithFullInformation: OrdersWithFullInformation =
            formatMediaFieldWithLoggingForOrders(
              [cancelledOrderWithFullInformation],
              (url: string) => this.awsService.buildPublicMediaUrl(url),
              this.logger,
            )[0];

          this.logger.log(
            `Cancelled order with ID: ${id} successfully in transaction`,
          );

          return returnCancelledOrderWithFullInformation;
        });

      return cancelledOrderWithFullInformation;
    } catch (error) {
      this.logger.error(`Failed to cancel order with ID ${id}: `, error);
      throw new BadRequestException(`Failed to cancel order with ID ${id}`);
    }
  }

  /**
   * Scan and cancel expired VNPay orders on a 5-minute cron schedule.
   *
   * Cron expression: '0 *\5 * * * *'.
   *
   * This method performs the following operations:
   * 1. Searches payment records where method is VNPay, status is PENDING,
   *    and `vnp_ExpireDate` is earlier than current time (formatted `YYYYMMDDHHmmss`).
   * 2. Restricts candidates to orders in `PENDING` or `PAYMENT_PROCESSING` state.
   * 3. Collects matching order IDs and resolves the current server internal IP.
   * 4. Iterates through each order and calls `cancelOrder(...)`.
   * 5. Logs per-order cancellation failures while continuing remaining orders.
   *
   * @returns {Promise<void>} Resolves after one cron scan/cancel cycle finishes
   *
   * @remarks
   * - Per-order errors are handled inside the loop so one failure does not stop the batch.
   * - Outer try/catch handles unexpected failures for the whole cron execution.
   * - Server IP is passed into cancellation flow for VNPay-related auditing fields.
   */
  @Cron('0 */5 * * * *')
  async handleCancelExpiredOrders() {
    this.logger.log('Scanning for expired orders...');

    try {
      await this.prismaService.$transaction(async (tx) => {
        // get all orders that orderStatus is Payment_Processing and PaymentStatus is Pending and Payment.vnp_expireDate < now()
        const expiredPayments = await tx.payments.findMany({
          where: {
            status: PaymentStatus.PENDING,
            paymentMethod: PaymentMethod.VNPAY,
            vnp_ExpireDate: {
              lt: BigInt(dayjs().format('YYYYMMDDHHmmss')), // compare with current date time in format YYYYMMDDHHmmss and convert to bigint
            },
            order: {
              status: {
                in: [OrderStatus.PENDING, OrderStatus.PAYMENT_PROCESSING],
              },
            },
          },
        });

        if (expiredPayments.length === 0) {
          this.logger.log('No expired orders found.');
          return;
        }

        this.logger.log(
          `Found ${expiredPayments.length} expired orders. Cancelling these orders...`,
        );

        const expiredOrderIds = expiredPayments.map(
          (payment) => payment.orderId,
        );

        // const serverIp = getServerInternalIp();

        // loop for order list and cancel order by call cancelOrder function for each order
        // await this.orderService.cancelExpiredOrders();
        for (const orderId of expiredOrderIds) {
          try {
            this.logger.log('Cancelling order with ID: ' + orderId);
            // await this.cancelOrder(Number(orderId), serverIp);
            await this.cancelOrder(Number(orderId));
            this.logger.log('Successfully cancelled order with ID: ' + orderId);
          } catch (error) {
            this.logger.error(
              'Error occurred while cancelling order with ID: ' + orderId,
              error,
            );
          }
        }
      });

      this.logger.log(
        'Successfully completed scanning and cancelling expired orders.',
      );
    } catch (error) {
      this.logger.error(
        'Error occurred while running cron job to cancel expired orders:',
        error,
      );
    }
  }

  /**
   * Auto-confirms delivered orders to completed status on a daily schedule.
   *
   * Cron expression: '0 0 7 * * *' (runs at 07:00:00 every day).
   *
   * This method performs the following operations:
   * 1. Computes the cutoff timestamp (`now - 7 days`)
   * 2. Finds orders with `OrderStatus.DELIVERED`
   * 3. Filters orders where every related shipment:
   *    - has status `ShipmentStatus.DELIVERED`
   *    - has non-null `ghnOrderCode`
   *    - has `deliveredAt` older than 7 days
   * 4. Iterates through matched orders and updates order status to `OrderStatus.COMPLETED`
   * 5. Logs per-order update failures while continuing the remaining batch
   *
   * @returns {Promise<void>} Resolves after one daily auto-confirm cycle finishes
   *
   * @remarks
   * - The method is best-effort per order: one failed update does not stop the full batch.
   * - Current query uses relation filter `shipments.every` to enforce shipment-level completion criteria.
   * - Execution timezone follows the runtime/server timezone unless application-level timezone handling is configured.
   */
  @Cron('0 0 7 * * *')
  async handleAutoConfirmCompletedOrders() {
    try {
      this.logger.log('Scanning for completed orders to auto-confirm...');

      const sevenDaysAgo = dayjs().subtract(7, 'day').toDate();

      const ordersToConfirm = await this.prismaService.orders.findMany({
        where: {
          status: OrderStatus.DELIVERED,
          shipments: {
            every: {
              status: ShipmentStatus.DELIVERED,
              ghnOrderCode: {
                not: null,
              },
              deliveredAt: {
                lt: sevenDaysAgo,
              },
            },
          },
        },
      });

      if (ordersToConfirm.length === 0) {
        this.logger.log('No completed orders found for auto-confirmation.');
        return;
      }

      this.logger.log(
        `Found ${ordersToConfirm.length} completed orders. Auto-confirming these orders...`,
      );

      for (const order of ordersToConfirm) {
        try {
          await this.prismaService.orders.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.COMPLETED,
            },
          });
          this.logger.log(`Auto-confirmed order with ID: ${order.id}`);
        } catch (error) {
          this.logger.error(
            `Error occurred while auto-confirming order with ID: ${order.id}`,
            error,
          );
        }
      }

      this.logger.log(
        'Successfully completed auto-confirmation of completed orders.',
      );
    } catch (error) {
      this.logger.error(
        'Error occurred while running cron job to auto-confirm completed orders:',
        error,
      );
    }
  }

  /**
   * Retrieves detailed information for a specific order.
   *
   * This method performs the following operations:
   * 1. Queries the database for the order by ID with full relations
   * 2. Validates order exists in the database
   * 3. Formats all media URLs for related entities
   * 4. Logs the fetch operation
   *
   * @param {number} id - The unique identifier of the order
   *
   * @returns {Promise<OrdersWithFullInformation | null>} Complete order details including:
   *   - Order information (id, status, dates, amounts, totals)
   *   - Shipping address with full location details
   *   - Order items with product variant information
   *   - Payment records with status
   *   - Shipment details with tracking information
   *   - All media formatted with public HTTPS URLs
   *   Returns null if order or formatting fails
   *
   * @throws {NotFoundException} If order is not found in database
   * @throws {BadRequestException} If data retrieval or formatting fails
   *
   * @remarks
   * - Includes all related entities for comprehensive order view
   * - Media URLs are converted to public HTTPS URLs
   * - Similar to findOne but with explicit detailed naming
   */
  async getOrderDetailInformation(
    id: number,
  ): Promise<OrdersWithFullInformation | null> {
    try {
      const result = await this.prismaService.orders.findFirst({
        where: { id: id },
        include: OrdersWithFullInformationInclude,
      });

      if (!result) {
        throw new NotFoundException('Order not found!');
      }

      const returnResult = formatMediaFieldWithLoggingForOrders(
        [result],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      if (!returnResult) {
        throw new NotFoundException('Order error after formatting media!');
      }

      this.logger.log(`Fetched order detail information with ID: ${id}`);
      return returnResult;
    } catch (error) {
      this.logger.error(
        `Failed to fetch order detail information with ID ${id}: `,
        error,
      );
      throw new BadRequestException('Failed to fetch order detail information');
    }
  }

  /**
   * Retrieves a paginated list of all orders with complete detail information.
   *
   * This method performs the following operations:
   * 1. Fetches paginated orders with all related information
   * 2. Includes full details for each order (address, items, payments, shipments)
   * 3. Formats media URLs for all related entities
   * 4. Logs the pagination parameters
   *
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of orders to retrieve per page
   *
   * @returns {Promise<OrdersWithFullInformation[] | []>} Paginated array of orders with detail information:
   *   - Complete order data with all nested relations
   *   - Shipping address details
   *   - Order items with product variants
   *   - Payment and shipment information
   *   - Formatted media URLs
   *   Returns empty array if no results
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by order ID in ascending order
   * - Provides same data as findAll with emphasis on "detail" aspect
   * - Media URLs are converted to public HTTPS URLs
   * - Empty array returned instead of null for consistency
   */
  async getAllOrdersWithDetailInformation(
    page: number,
    perPage: number,
  ): Promise<OrdersWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrdersWithFullInformation,
        Prisma.OrdersFindManyArgs
      >(
        this.prismaService.orders,
        {
          include: OrdersWithFullInformationInclude,
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      result.data = formatMediaFieldWithLoggingForOrders(
        result.data,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      this.logger.log(
        `Fetched all orders with detail information - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error(
        'Failed to fetch all orders with detail information: ',
        error,
      );
      throw new BadRequestException(
        'Failed to fetch all orders with detail information',
      );
    }
  }

  /**
   * Retrieves paginated confirmed orders for shop operations.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries orders with `OrderStatus.PAYMENT_CONFIRMED`
   * 3. Ensures at least one related shipment is still `ShipmentStatus.PENDING`
   * 4. Includes full order relationships (items, shipments, payment, requests)
   * 5. Sorts results by order ID ascending
   * 6. Formats media URLs in nested response entities
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of orders per page
   *
   * @returns {Promise<OrdersWithFullInformation[] | []>} Paginated confirmed orders with full details
   *
   * @throws {BadRequestException} If retrieval or media formatting fails
   *
   * @remarks
   * - This list represents confirmed orders that are not yet moved to pickup workflow
   * - Uses relation filter `shipments.some` with `PENDING` status
   */
  async getAllConfirmedOrdersOfShop(
    page: number,
    perPage: number,
  ): Promise<OrdersWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrdersWithFullInformation,
        Prisma.OrdersFindManyArgs
      >(
        this.prismaService.orders,
        {
          include: OrdersWithFullInformationInclude,
          orderBy: { id: 'asc' },
          where: {
            status: OrderStatus.PAYMENT_CONFIRMED,
            shipments: {
              some: {
                status: ShipmentStatus.PENDING,
              },
            },
          },
        },
        { page: page },
      );

      result.data = formatMediaFieldWithLoggingForOrders(
        result.data,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      this.logger.log(
        `Fetched all orders with detail information - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error(
        'Failed to fetch all orders with detail information: ',
        error,
      );
      throw new BadRequestException(
        'Failed to fetch all orders with detail information',
      );
    }
  }

  /**
   * Retrieves paginated shop orders waiting for GHN pickup.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries orders with `OrderStatus.WAITING_FOR_PICKUP`
   * 3. Ensures at least one related shipment is `ShipmentStatus.WAITING_FOR_PICKUP`
   * 4. Includes full order relationships (items, shipments, payment, requests)
   * 5. Sorts results by order ID ascending
   * 6. Formats media URLs in nested response entities
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of orders per page
   *
   * @returns {Promise<OrdersWithFullInformation[] | []>} Paginated orders waiting for GHN pickup
   *
   * @throws {BadRequestException} If retrieval or media formatting fails
   *
   * @remarks
   * - Intended for shop-side pickup preparation and handover monitoring
   * - Uses relation filter `shipments.some` with `WAITING_FOR_PICKUP` status
   */
  async getAllShopOrdersWaitingForGHNPickup(
    page: number,
    perPage: number,
  ): Promise<OrdersWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrdersWithFullInformation,
        Prisma.OrdersFindManyArgs
      >(
        this.prismaService.orders,
        {
          include: OrdersWithFullInformationInclude,
          orderBy: { id: 'asc' },
          where: {
            status: OrderStatus.WAITING_FOR_PICKUP,
            shipments: {
              some: {
                status: ShipmentStatus.WAITING_FOR_PICKUP,
              },
            },
          },
        },
        { page: page },
      );

      result.data = formatMediaFieldWithLoggingForOrders(
        result.data,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      this.logger.log(
        `Fetched all orders with detail information - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error(
        'Failed to fetch all orders with detail information: ',
        error,
      );
      throw new BadRequestException(
        'Failed to fetch all orders with detail information',
      );
    }
  }

  /**
   * Retrieves paginated shipped orders for shop operations.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries orders with `OrderStatus.SHIPPED`
   * 3. Ensures at least one related shipment is `ShipmentStatus.SHIPPED`
   * 4. Includes full order relationships (items, shipments, payment, requests)
   * 5. Sorts results by order ID ascending
   * 6. Formats media URLs in nested response entities
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of orders per page
   *
   * @returns {Promise<OrdersWithFullInformation[] | []>} Paginated shipped orders with full details
   *
   * @throws {BadRequestException} If retrieval or media formatting fails
   *
   * @remarks
   * - Uses relation filter `shipments.some` to match active in-transit shipment records
   */
  async getAllShippedOrdersOfShop(
    page: number,
    perPage: number,
  ): Promise<OrdersWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrdersWithFullInformation,
        Prisma.OrdersFindManyArgs
      >(
        this.prismaService.orders,
        {
          include: OrdersWithFullInformationInclude,
          orderBy: { id: 'asc' },
          where: {
            status: OrderStatus.SHIPPED,
            shipments: {
              some: {
                status: ShipmentStatus.SHIPPED,
              },
            },
          },
        },
        { page: page },
      );

      result.data = formatMediaFieldWithLoggingForOrders(
        result.data,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      this.logger.log(
        `Fetched all orders with detail information - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error(
        'Failed to fetch all orders with detail information: ',
        error,
      );
      throw new BadRequestException(
        'Failed to fetch all orders with detail information',
      );
    }
  }

  /**
   * Retrieves paginated delivered orders for shop operations.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries orders with `OrderStatus.DELIVERED`
   * 3. Ensures at least one related shipment is `ShipmentStatus.DELIVERED`
   * 4. Includes full order relationships (items, shipments, payment, requests)
   * 5. Sorts results by order ID ascending
   * 6. Formats media URLs in nested response entities
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of orders per page
   *
   * @returns {Promise<OrdersWithFullInformation[] | []>} Paginated delivered orders with full details
   *
   * @throws {BadRequestException} If retrieval or media formatting fails
   *
   * @remarks
   * - Uses relation filter `shipments.some` to ensure shipment-level delivery confirmation exists
   */
  async getAllDeliveredOrdersOfShop(
    page: number,
    perPage: number,
  ): Promise<OrdersWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrdersWithFullInformation,
        Prisma.OrdersFindManyArgs
      >(
        this.prismaService.orders,
        {
          include: OrdersWithFullInformationInclude,
          orderBy: { id: 'asc' },
          where: {
            status: OrderStatus.DELIVERED,
            shipments: {
              some: {
                status: ShipmentStatus.DELIVERED,
              },
            },
          },
        },
        { page: page },
      );

      result.data = formatMediaFieldWithLoggingForOrders(
        result.data,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      this.logger.log(
        `Fetched all orders with detail information - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error(
        'Failed to fetch all orders with detail information: ',
        error,
      );
      throw new BadRequestException(
        'Failed to fetch all orders with detail information',
      );
    }
  }

  /**
   * Retrieves paginated completed orders for shop operations.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries orders with `OrderStatus.COMPLETED`
   * 3. Includes full order relationships (items, shipments, payment, requests)
   * 4. Sorts results by order ID ascending
   * 5. Formats media URLs in nested response entities
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of orders per page
   *
   * @returns {Promise<OrdersWithFullInformation[] | []>} Paginated completed orders with full details
   *
   * @throws {BadRequestException} If retrieval or media formatting fails
   *
   * @remarks
   * - Completion is determined by order-level status in current implementation
   */
  async getAllCompletedOrdersOfShop(
    page: number,
    perPage: number,
  ): Promise<OrdersWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrdersWithFullInformation,
        Prisma.OrdersFindManyArgs
      >(
        this.prismaService.orders,
        {
          include: OrdersWithFullInformationInclude,
          orderBy: { id: 'asc' },
          where: {
            status: OrderStatus.COMPLETED,
          },
        },
        { page: page },
      );

      result.data = formatMediaFieldWithLoggingForOrders(
        result.data,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      this.logger.log(
        `Fetched all orders with detail information - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error(
        'Failed to fetch all orders with detail information: ',
        error,
      );
      throw new BadRequestException(
        'Failed to fetch all orders with detail information',
      );
    }
  }

  /**
   * Retrieves paginated cancelled orders for shop operations.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries orders with `OrderStatus.CANCELLED`
   * 3. Includes full order relationships (items, shipments, payment, requests)
   * 4. Sorts results by order ID ascending
   * 5. Formats media URLs in nested response entities
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of orders per page
   *
   * @returns {Promise<OrdersWithFullInformation[] | []>} Paginated cancelled orders with full details
   *
   * @throws {BadRequestException} If retrieval or media formatting fails
   *
   * @remarks
   * - Cancellation is determined by order-level status in current implementation
   */
  async getAllCancelledOrdersOfShop(
    page: number,
    perPage: number,
  ): Promise<OrdersWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrdersWithFullInformation,
        Prisma.OrdersFindManyArgs
      >(
        this.prismaService.orders,
        {
          include: OrdersWithFullInformationInclude,
          orderBy: { id: 'asc' },
          where: {
            status: OrderStatus.CANCELLED,
          },
        },
        { page: page },
      );

      result.data = formatMediaFieldWithLoggingForOrders(
        result.data,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      this.logger.log(
        `Fetched all orders with detail information - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error(
        'Failed to fetch all orders with detail information: ',
        error,
      );
      throw new BadRequestException(
        'Failed to fetch all orders with detail information',
      );
    }
  }

  /**
   * Retrieves paginated returned orders for shop operations.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries orders with `OrderStatus.RETURNED`
   * 3. Ensures all related shipments are `ShipmentStatus.RETURNED`
   * 4. Ensures all related payments are `PaymentStatus.REFUNDED`
   * 5. Includes full order relationships (items, shipments, payment, requests)
   * 6. Sorts results by order ID ascending
   * 7. Formats media URLs in nested response entities
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of orders per page
   *
   * @returns {Promise<OrdersWithFullInformation[] | []>} Paginated returned/refunded orders with full details
   *
   * @throws {BadRequestException} If retrieval or media formatting fails
   *
   * @remarks
   * - Uses relation filter `shipments.every` to enforce full shipment return state
   * - Uses relation filter `payment.every` to enforce full payment refund state
   */
  async getAllReturnedOrdersOfShop(
    page: number,
    perPage: number,
  ): Promise<OrdersWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrdersWithFullInformation,
        Prisma.OrdersFindManyArgs
      >(
        this.prismaService.orders,
        {
          include: OrdersWithFullInformationInclude,
          orderBy: { id: 'asc' },
          where: {
            status: OrderStatus.RETURNED,
            shipments: {
              every: {
                status: ShipmentStatus.RETURNED,
              },
            },
            payment: {
              every: {
                status: PaymentStatus.REFUNDED,
              },
            },
          },
        },
        { page: page },
      );

      result.data = formatMediaFieldWithLoggingForOrders(
        result.data,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      this.logger.log(
        `Fetched all orders with detail information - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error(
        'Failed to fetch all orders with detail information: ',
        error,
      );
      throw new BadRequestException(
        'Failed to fetch all orders with detail information',
      );
    }
  }

  /**
   * Retrieves all items in an order with product variant and media information.
   *
   * This method performs the following operations:
   * 1. Fetches all order items associated with the order ID
   * 2. Includes product variant details with all media
   * 3. Formats media URLs for each product variant
   * 4. Logs the fetch operation
   *
   * @param {number} id - The unique identifier of the order
   *
   * @returns {Promise<OrderItemsWithVariantAndMediaInformation[] | []>} Array of order items with details:
   *   - Order item quantities, prices, and discounts
   *   - Product variant information (size, color, SKU)
   *   - Product media with formatted HTTPS URLs
   *   - All images and assets for each variant
   *   Returns empty array if no items found
   *
   * @throws {NotFoundException} If no order items found
   * @throws {BadRequestException} If data fetching fails
   *
   * @remarks
   * - Includes all media for product variants
   * - Media URLs are converted to public HTTPS URLs
   * - Empty array returned for consistency
   */
  async getOrderItemListDetailInformation(
    id: number,
  ): Promise<OrderItemsWithVariantAndMediaInformation[] | []> {
    try {
      const result = await this.prismaService.orderItems.findMany({
        where: { orderId: id },
        include: {
          productVariant: {
            include: {
              media: true,
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundException('Order items not found!');
      }

      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        // convert product variant media field
        item.productVariant.media = formatMediaFieldWithLogging(
          item.productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'product variant',
          item.productVariant.id,
          this.logger,
        );
      }

      this.logger.log(`Fetched order items for order ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch order items for order ID ${id}: `,
        error,
      );
      throw new BadRequestException('Failed to fetch order items');
    }
  }

  /**
   * Retrieves all shipment records for a specific order with full details.
   *
   * This method performs the following operations:
   * 1. Fetches all shipments associated with the order
   * 2. Includes staff information who processed the shipment
   * 3. Includes staff media and user profile information
   * 4. Includes complete order information for each shipment
   * 5. Formats all media URLs to public HTTPS
   * 6. Logs the fetch operation
   *
   * @param {number} id - The unique identifier of the order
   *
   * @returns {Promise<ShipmentsWithFullInformation[] | []>} Array of shipments with details:
   *   - Shipment tracking number, dates, carrier, status
   *   - Processing staff information with profile media
   *   - Complete order details for context
   *   - Formatted media URLs
   *   Returns empty array if no shipments found
   *
   * @throws {NotFoundException} If no shipments found or formatting fails
   * @throws {BadRequestException} If data retrieval fails
   *
   * @remarks
   * - Includes staff profile information for accountability
   * - Media URLs are converted to public HTTPS URLs
   * - Includes full order context for each shipment
   */
  async getOrderShipmentsDetailInformation(
    id: number,
  ): Promise<ShipmentsWithFullInformation[] | []> {
    try {
      const result = await this.prismaService.shipments.findMany({
        where: { orderId: id },
        include: {
          processByStaff: {
            include: {
              userMedia: {
                where: {
                  isAvatarFile: true,
                },
              },
            },
          },
          order: {
            include: OrdersWithFullInformationInclude,
          },
        },
      });

      if (!result) {
        throw new NotFoundException('Order shipments not found!');
      }

      const returnResult = formatMediaFieldWithLoggingForShipments(
        result,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      if (!returnResult) {
        throw new NotFoundException('Order shipments error after formatting!');
      }

      this.logger.log(`Fetched order shipments for order ID: ${id}`);
      return returnResult;
    } catch (error) {
      this.logger.error(
        `Failed to fetch order shipments for order ID ${id}: `,
        error,
      );
      throw new BadRequestException('Failed to fetch order shipments');
    }
  }

  /**
   * Retrieves all payment records associated with a specific order.
   *
   * This method performs the following operations:
   * 1. Queries the database for all payments linked to the order
   * 2. Returns payment history and transaction details
   * 3. Logs the fetch operation
   *
   * @param {number} id - The unique identifier of the order
   *
   * @returns {Promise<Payments[] | []>} Array of payment records including:
   *   - Transaction ID and payment method
   *   - Payment amount and status (PENDING, COMPLETED, FAILED, etc.)
   *   - Payment dates and timestamps
   *   Returns empty array if no payments found
   *
   * @throws {NotFoundException} If no payments found
   * @throws {BadRequestException} If payment retrieval fails
   *
   * @remarks
   * - Returns all payment attempts for the order
   * - Useful for tracking payment history and disputes
   * - Empty array returned for consistency
   */
  async getOrderPaymentDetailInformation(id: number): Promise<Payments[] | []> {
    try {
      const result = await this.prismaService.payments.findMany({
        where: { orderId: id },
      });

      if (!result) {
        throw new NotFoundException('Order payments not found!');
      }

      this.logger.log(`Fetched order payments for order ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch order payments for order ID ${id}: `,
        error,
      );
      throw new BadRequestException('Failed to fetch order payments');
    }
  }

  /**
   * Retrieves all requests (returns/exchanges/complaints) for a specific order with full details.
   *
   * This method performs the following operations:
   * 1. Fetches all requests associated with the order
   * 2. Includes return request details and reasons
   * 3. Includes processing staff information with media
   * 4. Includes request media (images of issues/returns)
   * 5. Formats all media URLs to public HTTPS
   * 6. Logs the fetch operation
   *
   * @param {number} id - The unique identifier of the order
   *
   * @returns {Promise<Requests[] | []>} Array of requests with details:
   *   - Request type, status, and reason
   *   - Return request information if applicable
   *   - Processing staff details with profile images
   *   - Request media (proof images, documentation)
   *   - Formatted media URLs
   *   Returns empty array if no requests found
   *
   * @throws {NotFoundException} If no requests found
   * @throws {BadRequestException} If request retrieval fails
   *
   * @remarks
   * - Includes all return, exchange, and complaint requests
   * - Staff media and user profile information included
   * - Request media URLs converted to public HTTPS URLs
   * - Empty array returned for consistency
   */
  async getOrderRequestDetailInformation(id: number): Promise<Requests[] | []> {
    try {
      const result = await this.prismaService.requests.findMany({
        where: { orderId: id },
        include: {
          returnRequest: true,
          processByStaff: {
            include: {
              userMedia: {
                where: {
                  isAvatarFile: true,
                },
              },
            },
          },
          media: true,
        },
      });

      if (!result) {
        throw new NotFoundException('Order requests not found!');
      }

      // generate https url for media field
      for (let i = 0; i < result.length; i++) {
        const request = result[i];
        request.media = formatMediaFieldWithLogging(
          request.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'request',
          request.id,
          this.logger,
        );

        // generate https url for processByStaff user media field
        if (request.processByStaff) {
          request.processByStaff.userMedia = formatMediaFieldWithLogging(
            request.processByStaff.userMedia,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'user',
            request.processByStaff.id,
            this.logger,
          );
        }
      }

      this.logger.log(`Fetched order requests for order ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch order requests for order ID ${id}: `,
        error,
      );
      throw new BadRequestException('Failed to fetch order requests');
    }
  }
}
