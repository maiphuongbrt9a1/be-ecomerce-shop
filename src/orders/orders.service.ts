import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  DiscountType,
  OrderItems,
  Orders,
  OrderStatus,
  PaymentMethod,
  Payments,
  PaymentStatus,
  Prisma,
  Requests,
  ShipmentStatus,
} from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import {
  OrderItemsWithVariantAndMediaInformation,
  OrdersWithFullInformation,
  OrdersWithFullInformationInclude,
  PackageItemDetail,
  ShipmentsWithFullInformation,
} from '@/helpers/types/types';
import {
  formatMediaFieldWithLogging,
  formatMediaFieldWithLoggingForOrders,
  formatMediaFieldWithLoggingForShipments,
} from '@/helpers/utils';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import { ShipmentsService } from '@/shipments/shipments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import Ghn from 'giaohangnhanh';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
    private readonly shipmentsService: ShipmentsService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
  ): Promise<OrdersWithFullInformation> {
    try {
      // check packages in createOrderDto is not empty
      if (!createOrderDto.packages) {
        this.logger.error('No packages provided in create order request');
        throw new BadRequestException(
          'No packages provided in create order request',
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

      const startTime = Date.now();
      const processByStaffDefault = null;
      const orderDateDefault = new Date();
      const orderStatusDefault: OrderStatus =
        createOrderDto.paymentMethod === PaymentMethod.COD
          ? OrderStatus.PAYMENT_CONFIRMED
          : OrderStatus.PAYMENT_PROCESSING;
      const paymentStatusDefault: PaymentStatus = PaymentStatus.PENDING;
      const shipmentStatusDefault: ShipmentStatus = ShipmentStatus.PENDING;
      const productVariantIdList: bigint[] = [];
      const orderItems: PackageItemDetail[] = [];
      const orderItemIdMap = new Map<string, OrderItems>();

      let shippingFee = 0;
      let subTotal = 0;
      let discount = 0;
      let totalAmount = 0;

      // calculate shipping fee based on packages
      for (const ghnShopId in createOrderDto.packages) {
        shippingFee += createOrderDto.packages[ghnShopId].shippingFee;
        orderItems.push(...createOrderDto.packages[ghnShopId].packageItems);
      }

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

      // calculate sub total, discount and total amount
      for (const ghnShopId in createOrderDto.packages) {
        for (const item of createOrderDto.packages[ghnShopId].packageItems) {
          subTotal += item.totalPrice;

          // check discount type and calculate discount amount
          if (
            item.discountType === DiscountType.PERCENTAGE &&
            item.discountValue
          ) {
            discount += (item.totalPrice * item.discountValue) / 100;
          } else if (
            item.discountType === DiscountType.FIXED_AMOUNT &&
            item.discountValue
          ) {
            discount += item.discountValue ? item.discountValue : 0;
          } else {
            discount += 0;
          }
        }
      }

      totalAmount = subTotal + shippingFee - discount;

      // get product variant id list for checking stock quantity and updating stock quantity
      for (const item of orderItems) {
        productVariantIdList.push(BigInt(item.productVariantId));
      }

      const defaultOrderWithFullInformation: OrdersWithFullInformation =
        await this.prismaService.$transaction(async (tx) => {
          // get user order information for creating order and creating order on GHN
          const userFromDB = await tx.user.findUnique({
            where: {
              id: BigInt(createOrderDto.userId),
            },
          });

          if (!userFromDB) {
            this.logger.error(
              `User with ID ${createOrderDto.userId} not found!`,
            );
            throw new NotFoundException(
              `User with ID ${createOrderDto.userId} not found!`,
            );
          }

          // get product variant list for checking stock quantity
          const productVariants = await tx.productVariants.findMany({
            where: { id: { in: productVariantIdList } },
            include: {
              product: {
                include: {
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          });

          // Create a Map for O(1) lookup by ID
          const productVariantMap = new Map(
            productVariants.map((pv) => [pv.id.toString(), pv]),
          );

          // check stock for each item in orderItems
          // and after that update product and product variant stock quantity
          for (const item of orderItems) {
            const productVariant = productVariantMap.get(
              item.productVariantId.toString(),
            );

            // check order item is stock or out of stock
            // if order item are out of stock, throw error
            if (!productVariant) {
              this.logger.error(
                `Product variant with ID ${item.productVariantId} not found!`,
              );
              throw new NotFoundException(
                `Product variant with ID ${item.productVariantId} not found!`,
              );
            }

            if (productVariant.stock < item.quantity) {
              this.logger.error(
                `Product variant with ID ${item.productVariantId} is out of stock! Available stock: ${productVariant.stock}, Requested quantity: ${item.quantity}`,
              );
              throw new BadRequestException(
                `Product variant with ID ${item.productVariantId} is out of stock! Available stock: ${productVariant.stock}, Requested quantity: ${item.quantity}`,
              );
            }

            // reduce stock quantity for product variant
            const updateProductVariant = await tx.productVariants.update({
              where: { id: BigInt(item.productVariantId) },
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
              where: { id: updateProductVariant.product.id },
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
            // check discount type and calculate discount amount
            let orderItemDiscount = 0;
            if (
              item.discountType === DiscountType.PERCENTAGE &&
              item.discountValue
            ) {
              orderItemDiscount += (item.totalPrice * item.discountValue) / 100;
            } else if (
              item.discountType === DiscountType.FIXED_AMOUNT &&
              item.discountValue
            ) {
              orderItemDiscount += item.discountValue ? item.discountValue : 0;
            } else {
              orderItemDiscount += 0;
            }

            const newOrderItem = await tx.orderItems.create({
              data: {
                orderId: newOrder.id,
                productVariantId: BigInt(item.productVariantId),
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                discountValue: orderItemDiscount,
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

            orderItemIdMap.set(item.productVariantId.toString(), newOrderItem);
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

          // create api to create shipment for order on ghn and create shipment record in database
          for (const ghnShopId in createOrderDto.packages) {
            // create order on GHN
            const ghnConfig = {
              token: process.env.GHN_TOKEN!, // Thay bằng token của bạn
              shopId: Number(ghnShopId), // Thay bằng shopId của bạn
              host: process.env.GHN_HOST!,
              trackingHost: process.env.GHN_TRACKING_HOST!,
              testMode: process.env.GHN_TEST_MODE === 'true', // Bật chế độ test sẽ ghi đè tất cả host thành môi trường sandbox
            };

            const ghn = new Ghn(ghnConfig);

            // prepare content for GHN order
            let contentForGhnOrder = '';
            for (const item of createOrderDto.packages[ghnShopId]
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
                createOrderDto.packages[ghnShopId].ghnShopDetail.address,
              from_name: createOrderDto.packages[ghnShopId].ghnShopDetail.name,
              from_phone:
                createOrderDto.packages[ghnShopId].ghnShopDetail.phone,
              from_province_name:
                createOrderDto.packages[ghnShopId].ghnProvinceName,
              from_district_name:
                createOrderDto.packages[ghnShopId].ghnDistrictName,
              from_ward_name: createOrderDto.packages[ghnShopId].ghnWardName,

              payment_type_id: 2, // 1: seller pay, 2: buyer pay
              note: newOrder.description ? newOrder.description : undefined,
              required_note:
                'KHONGCHOXEMHANG' /**Note shipping order.Allowed values: CHOTHUHANG, CHOXEMHANGKHONGTHU, KHONGCHOXEMHANG. CHOTHUHANG mean Buyer can request to see and trial goods. CHOXEMHANGKHONGTHU mean Buyer can see goods but not allow to trial goods. KHONGCHOXEMHANG mean Buyer not allow to see goods */,
              return_phone:
                createOrderDto.packages[ghnShopId].ghnShopDetail.phone,
              return_address:
                createOrderDto.packages[ghnShopId].ghnShopDetail.address,
              return_district_id:
                createOrderDto.packages[ghnShopId].from_district_id,
              return_ward_code:
                createOrderDto.packages[ghnShopId].from_ward_code,
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
              to_ward_code: createOrderDto.packages[ghnShopId].to_ward_code,
              to_district_id: createOrderDto.packages[ghnShopId].to_district_id,
              cod_amount: totalAmountForGHNOrder,
              content: contentForGhnOrder,
              weight: createOrderDto.packages[ghnShopId].totalWeight,
              length: createOrderDto.packages[ghnShopId].maxLength,
              width: createOrderDto.packages[ghnShopId].maxWidth,
              height: createOrderDto.packages[ghnShopId].totalHeight,
              pick_station_id: undefined,
              insurance_value:
                newOrder.totalAmount < 5000000 ? newOrder.totalAmount : 5000000,
              service_id:
                createOrderDto.packages[ghnShopId].shippingService.service_id,
              service_type_id:
                createOrderDto.packages[ghnShopId].shippingService
                  .service_type_id,
              coupon: null,
              pick_shift: undefined,
              items:
                createOrderDto.packages[ghnShopId]
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

            // create shipment record in database
            const newShipment = await tx.shipments.create({
              data: {
                orderId: newOrder.id,
                processByStaffId: processByStaffDefault,
                ghnOrderCode: ghnCreateNewOrderRequest.order_code,
                estimatedDelivery:
                  ghnCreateNewOrderRequest.expected_delivery_time,
                estimatedShipDate:
                  ghnCreateNewOrderRequest.expected_delivery_time,
                carrier: createOrderDto.carrier,
                trackingNumber: ghnCreateNewOrderRequest.order_code,
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
            for (const item of createOrderDto.packages[ghnShopId]
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
          }

          this.logger.log(
            `Successfully created order, order items, payment, shipment, shipment items and ghn shipment for order with ID ${newOrder.id}`,
          );

          // log and return result
          const defaultOrderWithFullInformation = await tx.orders.findUnique({
            where: { id: newOrder.id },
            include: OrdersWithFullInformationInclude,
          });

          if (!defaultOrderWithFullInformation) {
            this.logger.error(
              `Failed to retrieve order with ID ${newOrder.id} after creation`,
            );

            throw new NotFoundException('Order not found after creation!');
          }

          return defaultOrderWithFullInformation;
        });

      const returnOrderWithFullInformation =
        formatMediaFieldWithLoggingForOrders(
          [defaultOrderWithFullInformation],
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
      this.logger.error('Failed to create order: ', error);
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
   * Updates an existing order with new information.
   *
   * This method performs the following operations:
   * 1. Validates the order ID exists
   * 2. Updates order fields based on the provided DTO
   * 3. Logs the update operation
   *
   * @param {number} id - The unique identifier of the order to update
   * @param {UpdateOrderDto} updateOrderDto - The data transfer object containing fields to update:
   *   - May include status, amounts, addresses, or other order properties
   *
   * @returns {Promise<Orders>} The updated order record with new values
   *
   * @throws {BadRequestException} If order update fails or validation fails
   *
   * @remarks
   * - Uses shallow merge spread operator to update fields
   * - Does not update related entities (items, payments, shipments)
   * - Only updates direct order properties
   */
  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Orders> {
    try {
      const result = await this.prismaService.orders.update({
        where: { id: id },
        data: { ...updateOrderDto },
      });

      this.logger.log(`Updated order with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update order with ID ${id}: `, error);
      throw new BadRequestException('Failed to update order');
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
              userMedia: true,
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
              userMedia: true,
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
