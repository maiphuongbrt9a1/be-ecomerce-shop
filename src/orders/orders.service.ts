import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Orders,
  OrderStatus,
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
  PackagesForShipping,
  ShipmentsWithFullInformation,
} from '@/helpers/types/types';
import dayjs from 'dayjs';
import {
  formatMediaFieldWithLogging,
  formatMediaFieldWithLoggingForOrders,
  formatMediaFieldWithLoggingForShipments,
  GHNShops,
} from '@/helpers/utils';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import { ShipmentsService } from '@/shipments/shipments.service';
import Ghn from 'giaohangnhanh';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
    private readonly shipmentsService: ShipmentsService,
  ) {}

  /**
   * Creates a new order with associated shipping address, order items, payment, and shipment (if COD).
   *
   * This method performs the following operations within a database transaction:
   * 1. Creates a new shipping address for the order
   * 2. Validates that all product variants have sufficient stock
   * 3. Decrements stock for both product variants and products
   * 4. Calculates order totals (subtotal, discount, total amount)
   * 5. Creates the order record
   * 6. Creates order items linked to the order
   * 7. Creates a payment record with PENDING status
   * 8. Creates a shipment record if payment method is COD
   *
   * @param {CreateOrderDto} createOrderDto - The data transfer object containing order details including:
   *   - userId: The ID of the user creating the order
   *   - orderItems: Array of items to be ordered with productVariantId, quantity, unitPrice, totalPrice, and optional discountValue
   *   - Shipping address details: street, ward, district, province, zipCode, country
   *   - paymentMethod: The payment method (e.g., 'COD')
   *   - carrier: The shipping carrier
   *
   * @returns {Promise<OrdersWithFullInformation>} The created order with all related information including:
   *   - Order details (id, status, dates, amounts)
   *   - Shipping address
   *   - Order items
   *   - Payment information
   *   - Shipment details
   *
   * @throws {NotFoundException} If a product variant is not found or order not found after creation
   * @throws {BadRequestException} If a product variant has insufficient stock or order creation fails
   *
   * @remarks
   * - Uses database transaction to ensure data consistency
   * - Shipping fee is currently hardcoded to 0
   * - Shipment is only created for COD payments; other payment methods create shipment after successful payment
   * - All monetary amounts are calculated from order item data
   */
  async create(
    createOrderDto: CreateOrderDto,
  ): Promise<OrdersWithFullInformation> {
    try {
      // prepare data for create new order
      return await this.prismaService.$transaction(async (tx) => {
        const userId = BigInt(createOrderDto.userId);
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

          packages[ghnShopId].packageItems.push(item);

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
          const province = await ghn.address.getProvinces();
          // tìm tỉnh ứng với tỉnh của người khách hàng cung cấp
          const toProvince = province.find((p) =>
            p.NameExtension.includes(createOrderDto.province),
          );

          if (!toProvince) {
            this.logger.log(`Province ${createOrderDto.province} not found`);
            throw new NotFoundException(
              `Province ${createOrderDto.province} not found`,
            );
          }

          // Lấy danh sách quận/huyện trong tỉnh đó
          const district = await ghn.address.getDistricts(
            toProvince.ProvinceID,
          );
          // tìm quận/huyện ứng với quận/huyện của người khách hàng cung cấp
          const toDistrict = district.find((d) =>
            d.NameExtension.includes(createOrderDto.district),
          );

          if (!toDistrict) {
            this.logger.log(`District ${createOrderDto.district} not found`);
            throw new NotFoundException(
              `District ${createOrderDto.district} not found`,
            );
          }

          // Lấy danh sách phường/xã trong quận/huyện đó
          const ward = await ghn.address.getWards(toDistrict.DistrictID);
          // tìm phường/xã ứng với phường/xã của người khách hàng cung cấp
          const toWard = ward.find((w) =>
            w.NameExtension.includes(createOrderDto.ward),
          );
          if (!toWard) {
            this.logger.log(`Ward ${createOrderDto.ward} not found`);
            throw new NotFoundException(
              `Ward ${createOrderDto.ward} not found`,
            );
          }

          // Lấy ra district id của shop office từ ghnShopId
          const ghnShopList = await ghnShops.getShopList();
          const ghnShopInfo = ghnShops.getShopInfo(
            ghnConfig.shopId,
            ghnShopList,
          );

          // Lấy dịch vụ vận chuyển đầu tiên trong danh sách dịch vụ có sẵn (hard code)
          const service = (
            await ghn.calculateFee.getServiceList(
              ghnShopInfo.district_id,
              toDistrict.DistrictID,
            )
          )[0];

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
          },
        });

        // please create order items after creating order
        for (const item of createOrderDto.orderItems) {
          await tx.orderItems.create({
            data: {
              orderId: result.id,
              productVariantId: BigInt(item.productVariantId),
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              discountValue: item.discountValue ? item.discountValue : 0,
            },
          });
        }

        // please create payments after creating order
        await tx.payments.create({
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

        // if COD, please create shipment after creating order
        // if other payment method, shipment will be created after payment is successful
        // please check update payment method in payments service to see more details about creating shipment after payment is successful
        if (createOrderDto.paymentMethod === 'COD') {
          await tx.shipments.create({
            data: {
              orderId: result.id,
              processByStaffId: processByStaff,
              estimatedDelivery: dayjs().add(1, 'days').toDate(),
              estimatedShipDate: dayjs().add(2, 'days').toDate(),
              carrier: createOrderDto.carrier,
              trackingNumber: `${Date.now()}-${result.id}-${userId}-${Math.floor(
                Math.random() * 10000000,
              )}`,
              status: ShipmentStatus.WAITING_FOR_PICKUP,
            },
          });
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
