import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateOrderDto,
  SecondCreateOrderItemsDto,
} from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  DiscountType,
  Orders,
  OrderStatus,
  PaymentMethod,
  Payments,
  PaymentStatus,
  Prisma,
  Requests,
} from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import {
  PackageItemDetail,
  OrderItemsWithVariantAndMediaInformation,
  OrdersWithFullInformation,
  OrdersWithFullInformationInclude,
  PackagesForShipping,
  ShipmentsWithFullInformation,
  PackageItemDetailForGHNCreateNewOrderRequest,
  GHNShopDetail,
} from '@/helpers/types/types';
import {
  formatMediaFieldWithLogging,
  formatMediaFieldWithLoggingForOrders,
  formatMediaFieldWithLoggingForShipments,
} from '@/helpers/utils';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import { ShipmentsService } from '@/shipments/shipments.service';
import {
  CalculateExpectedDeliveryTimeResponse,
  GetServiceResponse,
} from '@/helpers/types/calculate-shipping-fee';
import { createNewShipmentForOrderAndAutoCreateGHNShipmentDto } from '@/shipments/dto/create-shipment.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
    private readonly shipmentsService: ShipmentsService,
  ) {}

  /**
   * Creates a new order with all associated data in the system.
   *
   * This method performs a complex multi-step process:
   * 1. Calculates order totals (shipping fee, subtotal, discount, total amount)
   * 2. Updates product and variant stock quantities in a database transaction
   * 3. Creates the order, order items record with payment information
   * 4. For COD payments, creates shipment, shipment items records and integrates with GHN API
   *
   * @param {CreateOrderDto} createOrderDto - The order creation data including:
   *   - userId: Customer identifier
   *   - paymentMethod: Payment type (COD or VNPAY)
   *   - packages: Grouped items by ghn shop id with shipping fees
   *   - shippingAddress: Delivery address information
   *   - phone: Customer contact number
   *   - carrier: Shipping carrier details
   *   - description: Optional order notes
   *
   * @returns {Promise<OrdersWithFullInformation>} Complete order details including:
   *   - Order information (id, status, dates, amounts)
   *   - Shipping address
   *   - Order items with product variants
   *   - Payment records
   *   - Shipment details (for COD orders)
   *
   * @throws {BadRequestException} If any step fails (stock update, order, order items creation, payment creation, shipment, shipment items creation)
   * @throws {NotFoundException} If order is not found after creation
   *
   * @remarks
   * - Uses database transaction to ensure atomic operations for order and stock updates
   * - Shipments are created separately for COD payments to avoid transaction timeouts
   * - VNPAY payments skip shipment creation until payment success
   * - Performance is logged with execution time
   *
   * @example
   * const order = await ordersService.create({
   *   userId: 1,
   *   paymentMethod: PaymentMethod.COD,
   *   packages: { '123': { shippingFee: 50000, packageItems: [...] } },
   *   shippingAddress: { orderAddressInDb: { ... }, orderAddressInGHN: { toProvince: GhnProvince; toDistrict: GhnDistrict; toWard: GhnWard;}; },
   *   phone: '0123456789',
   *   carrier: 'GHN'
   * });
   */
  async create(
    createOrderDto: CreateOrderDto,
  ): Promise<OrdersWithFullInformation> {
    try {
      const startTime = Date.now();
      const processByStaff = null;
      const orderDate = new Date();
      const orderStatus = OrderStatus.PENDING;
      const orderItems: PackageItemDetail[] = [];

      let shippingFee = 0;
      let subTotal = 0;
      let discount = 0;
      let totalAmount = 0;

      // calculate shipping fee based on packages from different shop offices
      for (const ghnShopId in createOrderDto.packages) {
        shippingFee += createOrderDto.packages[ghnShopId].shippingFee;
        orderItems.push(...createOrderDto.packages[ghnShopId].packageItems);
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

      const defaultOrderWithFullInformation: OrdersWithFullInformation =
        await this.prismaService.$transaction(async (tx) => {
          // update product and product variant stock quantity
          for (const item of orderItems) {
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
              this.logger.log(
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
              this.logger.log(
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

          if (!newOrder) {
            this.logger.log(
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
          }

          // this is default payment information
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
              status: PaymentStatus.PENDING,
            },
          });

          if (!newPayment) {
            this.logger.log(
              `Failed to create payment for order with ID ${newOrder.id}`,
            );
            throw new BadRequestException(
              `Failed to create payment for order with ID ${newOrder.id}`,
            );
          }

          // about shipment and shipment items i will not create them here
          // because the customer won't payment successfully
          // if the payment method is COD, i will create shipment, shipment items after creating order successfully
          // and in the payment method is cod, create shipment and shipment items is separate transaction
          // because it will call ghn api and write shipment, shipment items in db.
          // if i create here, transaction will be too long, it will cause timeout and failed transaction.

          // log and return result
          const defaultOrderWithFullInformation = await tx.orders.findUnique({
            where: { id: newOrder.id },
            include: OrdersWithFullInformationInclude,
          });

          if (!defaultOrderWithFullInformation) {
            throw new NotFoundException('Order not found after creation!');
          }

          return defaultOrderWithFullInformation;
        });

      // i will create shipment and shipment items for the order if payment method is COD
      // and i call ghn api here to create shipment in ghn system and get back the shipping fee and expected delivery time
      let returnOrderWithFullInformation: OrdersWithFullInformation =
        defaultOrderWithFullInformation;

      if (createOrderDto.paymentMethod === PaymentMethod.COD) {
        const createNewShipmentForOrderAndAutoCreateGHNShipmentDto: createNewShipmentForOrderAndAutoCreateGHNShipmentDto =
          {
            orderId: defaultOrderWithFullInformation.id,
            carrier: createOrderDto.carrier,
            packages: createOrderDto.packages,
            createNewAddressForOrderResponseDto: createOrderDto.shippingAddress,
            customerPhoneForOrder: createOrderDto.phone,
          };

        const newShipment =
          await this.shipmentsService.createNewShipmentForOrderAndAutoCreateGHNShipment(
            createNewShipmentForOrderAndAutoCreateGHNShipmentDto,
          );

        if (!newShipment) {
          this.logger.log(
            `Failed to create shipment for order with ID ${defaultOrderWithFullInformation.id}`,
          );
          throw new BadRequestException(
            `Failed to create shipment for order with ID ${defaultOrderWithFullInformation.id}`,
          );
        }

        const tempOrderWithFullInformation =
          await this.prismaService.orders.findUnique({
            where: { id: defaultOrderWithFullInformation.id },
            include: OrdersWithFullInformationInclude,
          });

        if (!tempOrderWithFullInformation) {
          throw new NotFoundException(
            'Order not found after shipment, shipment items creation!',
          );
        }

        returnOrderWithFullInformation = tempOrderWithFullInformation;
      }

      /*
      // fix here to format media url for order, order items, shipment and shipment items
      
      // Note: this is expensive operation about time,
      // i will not format media url for order, order items, shipment and shipment items here
      // if you want to format media url for order, order items, shipment and shipment items, you can call getOrderDetailInformation api to get order detail information with formatted media url
      // or you can get builPublicMediaUrl from aws service and format media url in client side

      returnOrderWithFullInformation = formatMediaFieldWithLoggingForOrders(
        [returnOrderWithFullInformation],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      */
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

  /**
   * Groups order items into shipping packages organized by shop office.
   *
   * This method performs the following operations:
   * 1. Validates that all product variants exist and have sufficient stock
   * 2. Organizes items by their source shop office (for multi-seller orders)
   * 3. Calculates package dimensions and weight for each shop's shipment
   * 4. Prepares data for GHN (shipping provider) API integration
   *
   * @param {SecondCreateOrderItemsDto[]} orderItems - Array of items to be ordered, each containing:
   *   - productVariantId: Unique identifier of the product variant
   *   - quantity: Requested quantity
   *   - unitPrice: Price per unit
   *   - totalPrice: Total price for this item (quantity × unitPrice)
   *   - discountType: Type of discount (PERCENTAGE or FIXED_AMOUNT)
   *   - discountValue: Discount amount or percentage
   *   - currencyUnit: Currency code (e.g., VND)
   *   - discountDescription: Description of the discount applied
   *
   * @returns {Promise<PackagesForShipping>} Object mapping shop IDs to package information:
   *   - packageItems: Detailed item information for order
   *   - packageItemsForGHNCreateNewOrderRequest: Item data formatted for GHN API
   *   - totalWeight: Sum of all item weights (in grams)
   *   - totalHeight: Sum of all item heights (in cm)
   *   - maxLength: Maximum length among all items (in cm)
   *   - maxWidth: Maximum width among all items (in cm)
   *   - shippingFee: Calculated shipping cost (in VND)
   *   - expectedDeliveryTime: Estimated delivery timeline
   *   - GHN location details: Province, district, ward information
   *   - GHN service details: Selected shipping service
   *
   * @throws {NotFoundException} If:
   *   - Product variant doesn't exist in database
   *   - Product variant has no associated shop office
   *   - Shop office missing GHN integration details
   *
   * @throws {BadRequestException} If:
   *   - Requested quantity exceeds available stock
   *
   * @remarks
   * - Uses Map for O(1) lookup performance with large product variant lists
   * - Prevents duplicate database queries by batching variant lookups
   * - Supports order aggregation from multiple shop offices
   * - Calculates physical dimensions needed for GHN shipping rate calculation
   * - Validates stock availability before allowing order processing
   *
   * @example
   * const packages = await ordersService.groupOrderItemsToPackageShippingFollowingShopId([
   *   {
   *     productVariantId: '123',
   *     quantity: 2,
   *     unitPrice: 100000,
   *     totalPrice: 200000,
   *     discountType: DiscountType.PERCENTAGE,
   *     discountValue: 10,
   *     currencyUnit: 'VND'
   *   }
   * ]);
   * // Returns: { '456': { packageItems: [...], totalWeight: 500, ... } }
   */
  async groupOrderItemsToPackageShippingFollowingShopId(
    orderItems: SecondCreateOrderItemsDto[],
  ): Promise<PackagesForShipping> {
    try {
      const productVariantIdList = orderItems.map((item) =>
        BigInt(item.productVariantId),
      );
      const productVariants = await this.prismaService.productVariants.findMany(
        {
          where: { id: { in: productVariantIdList } },
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
        },
      );

      // Create a Map for O(1) lookup by ID
      const productVariantMap = new Map(
        productVariants.map((pv) => [pv.id.toString(), pv]),
      );
      const packages: PackagesForShipping = {};

      for (const item of orderItems) {
        const productVariant = productVariantMap.get(
          item.productVariantId.toString(),
        );

        // check order items is stock or out of stock
        // if order items are out of stock, throw error
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
      }

      this.logger.log(
        `Successfully grouped order items into packages following shop office ID.`,
      );
      return packages;
    } catch (error) {
      this.logger.error('Failed to group order items to package: ', error);
      throw error;
    }
  }
}
