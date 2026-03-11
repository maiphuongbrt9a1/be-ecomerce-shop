import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  createNewShipmentForOrderAndAutoCreateGHNShipmentDto,
  CreateShipmentDto,
} from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  Shipments,
  ShipmentStatus,
} from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import {
  createNewAddressForOrderResponseDto,
  OrdersWithFullInformationInclude,
  PackagesForShipping,
  ShipmentsWithFullInformation,
} from '@/helpers/types/types';
import {
  formatMediaFieldWithLoggingForShipments,
  GHNShops,
} from '@/helpers/utils';
import Ghn from 'giaohangnhanh';
import { GhnDistrict, GhnWard } from '@/helpers/types/ghn-address';
@Injectable()
export class ShipmentsService {
  private readonly logger = new Logger(ShipmentsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  /**
   * Creates a new shipment record for an order.
   *
   * This method performs the following operations:
   * 1. Creates a new shipment in the database
   * 2. Retrieves the created shipment with all related information
   * 3. Includes staff who processed the shipment and order details
   * 4. Formats all media URLs to public HTTPS URLs
   * 5. Logs the creation operation
   *
   * @param {CreateShipmentDto} createShipmentDto - The data transfer object containing shipment information:
   *   - orderId: The ID of the order to ship
   *   - carrier: Shipping carrier name (DHL, FedEx, etc.)
   *   - trackingNumber: Unique tracking identifier
   *   - estimatedDelivery: Expected delivery date
   *
   * @returns {Promise<ShipmentsWithFullInformation>} The created shipment with all details including:
   *   - Shipment information (id, status, dates, carrier, tracking)
   *   - Processing staff information with avatar media
   *   - Complete order details
   *   - Formatted media URLs
   *
   * @throws {BadRequestException} If shipment creation or retrieval fails
   *
   * @remarks
   * - Includes all related staff and order information
   * - Media URLs are converted to public HTTPS URLs
   */
  async create(
    createShipmentDto: CreateShipmentDto,
  ): Promise<ShipmentsWithFullInformation> {
    try {
      const result = await this.prismaService.shipments.create({
        data: { ...createShipmentDto },
      });

      if (!result) {
        throw new BadRequestException('Shipment creation failed');
      }

      let returnResult = await this.prismaService.shipments.findUnique({
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
        where: { id: result.id },
      });

      if (!returnResult) {
        throw new BadRequestException(
          'Shipment retrieval failed after creation',
        );
      }

      // generate public url for media fields in shipment
      returnResult = formatMediaFieldWithLoggingForShipments(
        [returnResult],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      this.logger.log('Shipment created successfully', result.id);
      return returnResult;
    } catch (error) {
      this.logger.log('Error creating shipment', error);
      throw new BadRequestException('Failed to create shipment');
    }
  }

  /**
   * Creates shipments for an order and automatically registers them with GHN shipping service.
   *
   * This method orchestrates the complete shipment creation flow including GHN API integration.
   * It handles orders with multiple packages from different shop offices (warehouses),
   * creates GHN shipping orders, and stores shipment records in the database.
   *
   * Process flow:
   * 1. Extracts packages and delivery address from request DTO
   * 2. Fetches order details including user, payment methods, and order items
   * 3. Creates order item lookup map for efficient shipment item creation
   * 4. Iterates through each package grouped by GHN shop ID (warehouse)
   * 5. For each package:
   *    a. Validates shop office exists in database
   *    b. Verifies payment is COD or already PAID
   *    c. Configures GHN API client with shop credentials
   *    d. Builds order content string with product details
   *    e. Determines COD amount (0 for non-COD, full amount for COD)
   *    f. Creates GHN shipping order with pickup/destination details
   *    g. Creates shipment record in database (transaction)
   *    h. Creates shipment items linking order items to shipment
   * 6. Returns array of created shipment records
   *
   * @param {createNewShipmentForOrderAndAutoCreateGHNShipmentDto} createNewShipmentForOrderAndAutoCreateGHNShipmentDto - DTO containing:
   *   - orderId: ID of the order to ship
   *   - packages: Object mapping ghnShopId to package details (items, dimensions, shipping service)
   *   - createNewAddressForOrderResponseDto: Delivery address (database + GHN format)
   *   - customerPhoneForOrder: Customer phone number for delivery
   *   - carrier: Shipping carrier name (e.g., 'GHN')
   *
   * @returns {Promise<Shipments[] | []>} Array of created shipment records (one per package/warehouse).
   *   Returns empty array if no packages meet criteria (payment not COD/PAID).
   *   Each shipment includes tracking number, GHN order code, estimated delivery date.
   *
   * @throws {NotFoundException} If order not found or shop office not found for GHN shop ID
   * @throws {BadRequestException} If GHN order creation fails, shipment creation fails, or shipment item creation fails
   *
   * @remarks
   * - Supports multi-warehouse fulfillment (creates separate shipment per warehouse)
   * - Only creates shipments for COD or PAID orders (skips unpaid non-COD orders)
   * - COD amount: Set to 0 for non-COD payments (already paid), full amount for COD
   * - GHN payment_type_id: Always 2 (buyer pays shipping fee)
   * - required_note: Set to 'KHONGCHOXEMHANG' (buyer cannot see/trial goods)
   * - Insurance value: Capped at 5,000,000 VND (GHN limit)
   * - Shipment status: Initially set to WAITING_FOR_PICKUP
   * - Uses database transaction for atomic shipment + shipment items creation
   * - GHN order code used as tracking number for shipment
   * - Expected delivery time from GHN used for both estimatedDelivery and estimatedShipDate
   * - Order content includes product variant details (name, SKU, size, color, quantity, price)
   * - Package dimensions and weight from pre-calculated values in DTO
   * - Pickup address from shop office GHN details
   * - Delivery address from order address (database + GHN IDs)
   * - Logs all errors before throwing exceptions for debugging
   * - Used in order fulfillment workflow after order confirmation
   *
   * @example
   * // Create shipments for order with 2 warehouses
   * const shipments = await shipmentsService.createNewShipmentForOrderAndAutoCreateGHNShipment({
   *   orderId: 12345n,
   *   carrier: 'GHN',
   *   customerPhoneForOrder: '0901234567',
   *   packages: {
   *     '1001': { // GHN shop ID for warehouse 1
   *       packageItems: [...],
   *       totalWeight: 500,
   *       maxLength: 30,
   *       maxWidth: 20,
   *       totalHeight: 10,
   *       shippingService: { service_id: 53320, service_type_id: 2 },
   *       ghnShopDetail: { ... },
   *       // ... other package details
   *     },
   *     '1002': { ... } // Warehouse 2
   *   },
   *   createNewAddressForOrderResponseDto: {
   *     orderAddressInDb: { ... },
   *     orderAddressInGHN: { ... }
   *   }
   * });
   * // Returns: [shipment1, shipment2] - one per warehouse
   */
  async createNewShipmentForOrderAndAutoCreateGHNShipment(
    createNewShipmentForOrderAndAutoCreateGHNShipmentDto: createNewShipmentForOrderAndAutoCreateGHNShipmentDto,
  ): Promise<Shipments[] | []> {
    try {
      const packages =
        createNewShipmentForOrderAndAutoCreateGHNShipmentDto.packages;
      const createNewAddressForOrderResponseDto =
        createNewShipmentForOrderAndAutoCreateGHNShipmentDto.createNewAddressForOrderResponseDto;

      const result: Shipments[] = [];

      // Debug: Log the  orderId being used
      this.logger.log(
        `Querying for order with ID: ${createNewShipmentForOrderAndAutoCreateGHNShipmentDto.orderId}`,
      );

      const orderInformationDetailFromDB =
        await this.prismaService.orders.findUnique({
          where: {
            id: createNewShipmentForOrderAndAutoCreateGHNShipmentDto.orderId,
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            payment: {
              select: {
                paymentMethod: true,
                status: true,
              },
            },
            orderItems: true,
          },
        });

      if (!orderInformationDetailFromDB) {
        this.logger.log(
          `Order with ID ${createNewShipmentForOrderAndAutoCreateGHNShipmentDto.orderId} not found!`,
        );
        throw new NotFoundException(
          `Order with ID ${createNewShipmentForOrderAndAutoCreateGHNShipmentDto.orderId} not found!`,
        );
      }

      // Debug: Log order items from database
      this.logger.log(
        `Order items from DB: ${JSON.stringify(
          orderInformationDetailFromDB.orderItems.map((oi) => ({
            id: oi.id.toString(),
            productVariantId: oi.productVariantId.toString(),
            quantity: oi.quantity,
          })),
        )}`,
      );

      const orderItemIdMap = new Map(
        orderInformationDetailFromDB.orderItems.map((orderItem) => [
          orderItem.productVariantId.toString(),
          orderItem,
        ]),
      );

      // Debug: Log map keys
      this.logger.log(
        `orderItemIdMap keys: ${JSON.stringify(Array.from(orderItemIdMap.keys()))}`,
      );
      this.logger.log(`orderItemIdMap size: ${orderItemIdMap.size}`);

      for (const ghnShopId in packages) {
        // Debug: Log package items for this shop
        this.logger.log(
          `Processing package for ghnShopId: ${ghnShopId}, packageItems: ${JSON.stringify(
            packages[ghnShopId].packageItems.map((pi) => ({
              productVariantId: pi.productVariantId,
              quantity: pi.quantity,
              productVariantName: pi.productVariantName,
            })),
          )}`,
        );

        const shopOffice = await this.prismaService.shopOffice.findFirst({
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

        if (
          orderInformationDetailFromDB.payment.find(
            (payment) =>
              payment.paymentMethod == PaymentMethod.COD ||
              payment.status == PaymentStatus.PAID,
          )
        ) {
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

          // default (COD payment method) -> total amount for ghn shipment is the total amount of the order.
          let totalAmount = orderInformationDetailFromDB.totalAmount;

          // if the order has any non-COD payment method, set total amount for GHN shipment to 0 to avoid collect money from customer when delivery
          if (
            orderInformationDetailFromDB.payment.find(
              (payment) => payment.paymentMethod != PaymentMethod.COD,
            )
          ) {
            totalAmount = 0;
          }

          const ghnCreateNewOrderRequest = await ghn.order.createOrder({
            from_address: packages[ghnShopId].ghnShopDetail.address,
            from_name: packages[ghnShopId].ghnShopDetail.name,
            from_phone: packages[ghnShopId].ghnShopDetail.phone,
            from_province_name: packages[ghnShopId].ghnProvinceName,
            from_district_name: packages[ghnShopId].ghnDistrictName,
            from_ward_name: packages[ghnShopId].ghnWardName,

            payment_type_id: 2, // 1: seller pay, 2: buyer pay
            note: orderInformationDetailFromDB.description
              ? orderInformationDetailFromDB.description
              : undefined,
            required_note:
              'KHONGCHOXEMHANG' /**Note shipping order.Allowed values: CHOTHUHANG, CHOXEMHANGKHONGTHU, KHONGCHOXEMHANG. CHOTHUHANG mean Buyer can request to see and trial goods. CHOXEMHANGKHONGTHU mean Buyer can see goods but not allow to trial goods. KHONGCHOXEMHANG mean Buyer not allow to see goods */,
            return_phone: packages[ghnShopId].ghnShopDetail.phone,
            return_address: packages[ghnShopId].ghnShopDetail.address,
            return_district_id: packages[ghnShopId].from_district_id,
            return_ward_code: packages[ghnShopId].from_ward_code,
            client_order_code: null,
            to_name:
              orderInformationDetailFromDB.user.firstName +
              ' ' +
              orderInformationDetailFromDB.user.lastName,
            to_phone:
              createNewShipmentForOrderAndAutoCreateGHNShipmentDto.customerPhoneForOrder,
            to_address:
              createNewAddressForOrderResponseDto.orderAddressInDb.street +
              ' ' +
              createNewAddressForOrderResponseDto.orderAddressInDb.ward +
              ' ' +
              createNewAddressForOrderResponseDto.orderAddressInDb.district +
              ' ' +
              createNewAddressForOrderResponseDto.orderAddressInDb.province +
              ' ' +
              createNewAddressForOrderResponseDto.orderAddressInDb.country,
            to_ward_code: packages[ghnShopId].to_ward_code,
            to_district_id: packages[ghnShopId].to_district_id,
            cod_amount: totalAmount,
            content: contentForGhnOrder,
            weight: packages[ghnShopId].totalWeight,
            length: packages[ghnShopId].maxLength,
            width: packages[ghnShopId].maxWidth,
            height: packages[ghnShopId].totalHeight,
            pick_station_id: undefined,
            insurance_value:
              orderInformationDetailFromDB.totalAmount < 5000000
                ? orderInformationDetailFromDB.totalAmount
                : 5000000,
            service_id: packages[ghnShopId].shippingService.service_id,
            service_type_id:
              packages[ghnShopId].shippingService.service_type_id,
            coupon: null,
            pick_shift: undefined,
            items: packages[ghnShopId].packageItemsForGHNCreateNewOrderRequest,
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
          const createNewShipmentForOrderAndAutoCreateGHNShipmentResponseDto =
            await this.prismaService.$transaction(async (tx) => {
              const updatedOrder = await tx.orders.update({
                where: {
                  id: orderInformationDetailFromDB.id,
                },
                data: {
                  status: OrderStatus.PAYMENT_CONFIRMED,
                },
              });

              if (!updatedOrder) {
                this.logger.log(
                  `Failed to update status for order with ID ${orderInformationDetailFromDB.id}`,
                );
                throw new BadRequestException(
                  `Failed to update status for order with ID ${orderInformationDetailFromDB.id}`,
                );
              }

              const newShipment = await tx.shipments.create({
                data: {
                  orderId: orderInformationDetailFromDB.id,
                  processByStaffId: null,
                  ghnOrderCode: ghnCreateNewOrderRequest.order_code,
                  shopOfficeId: BigInt(shopOffice.id),
                  estimatedDelivery:
                    ghnCreateNewOrderRequest.expected_delivery_time,
                  estimatedShipDate:
                    ghnCreateNewOrderRequest.expected_delivery_time,
                  carrier:
                    createNewShipmentForOrderAndAutoCreateGHNShipmentDto.carrier,
                  trackingNumber: ghnCreateNewOrderRequest.order_code,
                  status: ShipmentStatus.PENDING,
                  description: orderInformationDetailFromDB.description
                    ? orderInformationDetailFromDB.description
                    : '',
                },
              });

              if (!newShipment) {
                this.logger.log(
                  `Failed to create shipment for order with ID ${orderInformationDetailFromDB.id}`,
                );
                throw new BadRequestException(
                  `Failed to create shipment for order with ID ${orderInformationDetailFromDB.id}`,
                );
              }

              // create shipment items record in database
              for (const item of packages[ghnShopId].packageItems) {
                // Debug: Log what we're looking for
                this.logger.log(
                  `Looking for productVariantId: ${item.productVariantId} (type: ${typeof item.productVariantId})`,
                );

                const orderItemId = orderItemIdMap.get(
                  item.productVariantId.toString(),
                )?.id;

                if (!orderItemId) {
                  this.logger.log(
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
                  this.logger.log(
                    `Failed to create shipment item for order item with product variant ID ${item.productVariantId}`,
                  );
                  throw new BadRequestException(
                    `Failed to create shipment item for order item with product variant ID ${item.productVariantId}`,
                  );
                }
              }

              return newShipment;
            });

          if (!createNewShipmentForOrderAndAutoCreateGHNShipmentResponseDto) {
            this.logger.log(
              `Failed to create shipment and shipment items for order with ID ${orderInformationDetailFromDB.id}`,
            );
            throw new BadRequestException(
              `Failed to create shipment and shipment items for order with ID ${orderInformationDetailFromDB.id}`,
            );
          }

          result.push(
            createNewShipmentForOrderAndAutoCreateGHNShipmentResponseDto,
          );
        }
      }

      this.logger.log(
        `Successfully created shipments for order with ID ${createNewShipmentForOrderAndAutoCreateGHNShipmentDto.orderId}`,
      );
      return result;
    } catch (error) {
      this.logger.log(
        'Error creating new shipment for order and auto create GHN shipment',
        error,
      );
      throw new BadRequestException(
        'Failed to create new shipment for order and auto create GHN shipment',
      );
    }
  }

  /**
   * Retrieves a paginated list of all shipments with complete information.
   *
   * This method performs the following operations:
   * 1. Fetches shipments from the database with pagination
   * 2. Includes staff information who processed each shipment
   * 3. Includes complete order information for each shipment
   * 4. Formats all media URLs to public HTTPS URLs
   * 5. Orders results by shipment ID
   *
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of shipments to retrieve per page
   *
   * @returns {Promise<ShipmentsWithFullInformation[] | []>} Array of shipments with all details including:
   *   - Shipment information (id, status, dates, carrier, tracking)
   *   - Processing staff information with avatar media
   *   - Complete order details
   *   - Formatted media URLs
   *   Returns empty array if no shipments found
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by shipment ID in ascending order
   * - Media URLs are converted to public HTTPS URLs
   * - Includes comprehensive tracking and staff information
   */
  async findAll(
    page: number,
    perPage: number,
  ): Promise<ShipmentsWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ShipmentsWithFullInformation,
        Prisma.ShipmentsFindManyArgs
      >(
        this.prismaService.shipments,
        {
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
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate public url for media fields in shipments
      result.data = formatMediaFieldWithLoggingForShipments(
        result.data,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      this.logger.log('Fetched shipments successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error fetching shipments', error);
      throw new BadRequestException('Failed to fetch shipments');
    }
  }

  /**
   * Retrieves a single shipment by ID with complete information.
   *
   * This method performs the following operations:
   * 1. Queries the database for the shipment by ID
   * 2. Includes staff information who processed the shipment
   * 3. Includes complete order information
   * 4. Formats all media URLs to public HTTPS URLs
   * 5. Logs retrieval operation
   *
   * @param {number} id - The unique identifier of the shipment to retrieve
   *
   * @returns {Promise<ShipmentsWithFullInformation | null>} The shipment with all details including:
   *   - Shipment information (id, status, dates, carrier, tracking)
   *   - Processing staff information with avatar media
   *   - Complete order details
   *   - Formatted media URLs
   *   Returns null if shipment not found
   *
   * @throws {NotFoundException} If shipment is not found
   * @throws {BadRequestException} If data fetching or formatting fails
   *
   * @remarks
   * - Media URLs are converted to public HTTPS URLs
   * - Includes staff profile for accountability tracking
   */
  async findOne(id: number): Promise<ShipmentsWithFullInformation | null> {
    try {
      let result = await this.prismaService.shipments.findFirst({
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
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Shipments not found!');
      }

      // generate public url for media fields in shipment
      result = formatMediaFieldWithLoggingForShipments(
        [result],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      this.logger.log('Fetched shipment successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error fetching shipment', error);
      throw new BadRequestException('Failed to fetch shipment');
    }
  }

  /**
   * Updates an existing shipment with new information.
   *
   * This method performs the following operations:
   * 1. Updates the shipment in the database
   * 2. Retrieves the updated shipment with all related information
   * 3. Includes staff and order details
   * 4. Formats all media URLs to public HTTPS URLs
   * 5. Logs the update operation
   *
   * @param {number} id - The unique identifier of the shipment to update
   * @param {UpdateShipmentDto} updateShipmentDto - The data transfer object containing shipment updates:
   *   - May include status, tracking number, estimated dates, or other properties
   *
   * @returns {Promise<ShipmentsWithFullInformation>} The updated shipment with all details including:
   *   - Updated shipment information
   *   - Processing staff information with avatar media
   *   - Complete order details
   *   - Formatted media URLs
   *
   * @throws {BadRequestException} If shipment update or retrieval fails
   *
   * @remarks
   * - Validates successful update before returning data
   * - Includes all shipment context information
   * - Media URLs are converted to public HTTPS URLs
   */
  async update(
    id: number,
    updateShipmentDto: UpdateShipmentDto,
  ): Promise<ShipmentsWithFullInformation> {
    try {
      const result = await this.prismaService.shipments.update({
        where: { id: id },
        data: { ...updateShipmentDto },
      });

      if (!result) {
        throw new BadRequestException('Shipment update failed');
      }

      let returnResult = await this.prismaService.shipments.findUnique({
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
        where: { id: result.id },
      });

      if (!returnResult) {
        throw new BadRequestException('Shipment retrieval failed after update');
      }
      // generate public url for media fields in shipment
      returnResult = formatMediaFieldWithLoggingForShipments(
        [returnResult],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      this.logger.log('Shipment updated successfully', returnResult.id);
      return returnResult;
    } catch (error) {
      this.logger.log('Error updating shipment', error);
      throw new BadRequestException('Failed to update shipment');
    }
  }

  /**
   * Deletes a shipment record from the database.
   *
   * This method performs the following operations:
   * 1. Removes the shipment record from the database
   * 2. Logs the deletion operation
   *
   * @param {number} id - The unique identifier of the shipment to delete
   *
   * @returns {Promise<Shipments>} The deleted shipment record
   *
   * @throws {BadRequestException} If deletion fails or shipment not found
   *
   * @remarks
   * - Verify before deletion as this action cannot be easily reversed
   * - Consider archiving instead of deleting for order history
   * - Use with caution in production environments
   */
  async remove(id: number): Promise<Shipments> {
    try {
      this.logger.log('Deleting shipment', id);
      return await this.prismaService.shipments.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log('Error deleting shipment', error);
      throw new BadRequestException('Failed to delete shipment');
    }
  }

  /**
   * Calculates and previews shipping fees for each package/warehouse in an order.
   *
   * This method enriches package information with GHN shipping fees, delivery estimates,
   * and complete address details for each warehouse. It queries GHN APIs to calculate
   * costs based on origin (warehouse), destination (customer), package dimensions, and weight.
   *
   * Process flow:
   * 1. Iterates through packages grouped by GHN shop ID (warehouse)
   * 2. For each warehouse:
   *    a. Validates shop office exists in database
   *    b. Verifies shop has complete GHN address info (province, district, ward)
   *    c. Initializes GHN API client with shop credentials
   *    d. Retrieves package dimensions and weight from packages object
   *    e. Gets destination address (customer delivery location) from DTO
   *    f. Fetches shop office details from GHN API (name, phone, address)
   *    g. Resolves origin address hierarchy:
   *       - Fetches all GHN provinces
   *       - Finds origin province by shop's ghnShopProvinceId
   *       - Fetches districts in origin province
   *       - Finds origin district by shop's ghnShopDistrictId
   *       - Fetches wards in origin district
   *       - Finds origin ward by shop's ghnShopWardCode
   *    h. Gets first available shipping service for route (origin → destination)
   *    i. Calculates shipping fee using:
   *       - Origin and destination IDs
   *       - Package dimensions (height, length, width, weight)
   *       - Service type
   *    j. Calculates expected delivery time
   *    k. Enriches package object with all calculated data
   * 3. Returns packages object with added shipping information
   *
   * @param {PackagesForShipping} packages - Object mapping ghnShopId to package details:
   *   - Each key is a GHN shop ID (string representation)
   *   - Each value contains: packageItems, totalWeight, totalHeight, maxLength, maxWidth
   *   - Modified in-place to add: shippingFee, shippingService, expectedDeliveryTime,
   *     ghnShopDetail, address names, district/ward codes
   *
   * @param {createNewAddressForOrderResponseDto} createNewAddressForOrderResponseDto - Customer delivery address:
   *   - orderAddressInDb: Database address record
   *   - orderAddressInGHN: GHN address components (toProvince, toDistrict, toWard)
   *   - Used to determine destination for shipping calculations
   *
   * @returns {Promise<PackagesForShipping>} Enriched packages object with added properties for each warehouse:
   *   - ghnShopId: Numeric GHN shop ID
   *   - ghnShopDetail: Shop info (name, phone, address) from GHN
   *   - ghnProvinceName: Origin province name
   *   - ghnDistrictName: Origin district name
   *   - ghnWardName: Origin ward name
   *   - shippingFee: Total shipping cost (from GHN calculation)
   *   - shippingService: Service details (service_id, service_type_id, short_name)
   *   - from_district_id: Origin district ID (for GHN API calls)
   *   - from_ward_code: Origin ward code (for GHN API calls)
   *   - to_district_id: Destination district ID (for GHN API calls)
   *   - to_ward_code: Destination ward code (for GHN API calls)
   *   - expectedDeliveryTime: Estimated delivery date and time
   *
   * @throws {NotFoundException} In the following cases:
   *   - Shop office not found for GHN shop ID
   *   - Shop office has incomplete GHN address information
   *   - Origin province not found in GHN system
   *   - Districts not found for origin province
   *   - Origin district not found in province
   *   - Wards not found for origin district
   *   - Origin ward not found in district
   * @throws {BadRequestException} If GHN API calls fail or unexpected errors occur
   *
   * @remarks
   * - Modifies packages object in-place (mutates input parameter)
   * - Supports multi-warehouse orders (different origin points)
   * - Uses first available shipping service (hardcoded selection)
   * - GHN API requires hierarchical address resolution (province → district → ward)
   * - Package dimensions must be in GHN-accepted units (grams for weight, cm for dimensions)
   * - Shipping service selection: Currently selects first service returned by GHN
   * - Service types may vary based on route and package characteristics
   * - Expected delivery time depends on service type and distance
   * - All GHN shop IDs are stored as BigInt in database but used as numbers for GHN API
   * - Used during checkout process to show shipping costs before order confirmation
   * - Customer can review fees before completing purchase
   * - Logs all validation errors before throwing exceptions
   * - Province/District/Ward hierarchy must be correctly stored in shop office
   * - GHN test mode controlled by GHN_TEST_MODE environment variable
   * - Test mode uses sandbox environment (different host and data)
   *
   * @example
   * // Calculate shipping fees for order with 2 warehouses
   * const packages = {
   *   '1001': { // Warehouse 1
   *     packageItems: [...],
   *     totalWeight: 500, // grams
   *     maxLength: 30,    // cm
   *     maxWidth: 20,     // cm
   *     totalHeight: 10   // cm
   *   },
   *   '1002': { // Warehouse 2
   *     packageItems: [...],
   *     totalWeight: 300,
   *     maxLength: 25,
   *     maxWidth: 15,
   *     totalHeight: 8
   *   }
   * };
   *
   * const enrichedPackages = await shipmentsService.previewShippingFeeForEachPackageForOrder(
   *   packages,
   *   {
   *     orderAddressInDb: { street: '...', ward: '...', district: '...', province: '...', country: 'Vietnam' },
   *     orderAddressInGHN: {
   *       toProvince: { ProvinceID: 202, ProvinceName: 'Hồ Chí Minh' },
   *       toDistrict: { DistrictID: 1542, DistrictName: 'Quận 1' },
   *       toWard: { WardCode: '21211', WardName: 'Phường Bến Nghé' }
   *     }
   *   }
   * );
   *
   * // enrichedPackages now contains shipping fees:
   * // {
   * //   '1001': { ..., shippingFee: 25000, expectedDeliveryTime: '2026-03-01T10:00:00Z', ... },
   * //   '1002': { ..., shippingFee: 20000, expectedDeliveryTime: '2026-03-01T10:00:00Z', ... }
   * // }
   */
  async previewShippingFeeForEachPackageForOrder(
    packages: PackagesForShipping,
    createNewAddressForOrderResponseDto: createNewAddressForOrderResponseDto,
  ): Promise<PackagesForShipping> {
    try {
      // calculate shipping fee based on packages from different shop offices
      for (const ghnShopId in packages) {
        const shopOffice = await this.prismaService.shopOffice.findFirst({
          where: { ghnShopId: BigInt(ghnShopId) },
        });

        // check conditions to ensure we have necessary GHN shop information to proceed with shipping fee calculation
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

        // init ghn config
        const ghnConfig = {
          token: process.env.GHN_TOKEN!, // Thay bằng token của bạn
          shopId: Number(ghnShopId), // Thay bằng shopId của bạn
          host: process.env.GHN_HOST!,
          trackingHost: process.env.GHN_TRACKING_HOST!,
          testMode: process.env.GHN_TEST_MODE === 'true', // Bật chế độ test sẽ ghi đè tất cả host thành môi trường sandbox
        };
        const ghn = new Ghn(ghnConfig);
        const ghnShops = new GHNShops(ghnConfig);

        // define the dimensions and weight for the package to be shipped
        const totalWeightForOnePackage = packages[ghnShopId].totalWeight;
        const totalHeightForOnePackage = packages[ghnShopId].totalHeight;
        const maxLengthForOnePackage = packages[ghnShopId].maxLength;
        const maxWidthForOnePackage = packages[ghnShopId].maxWidth;

        // define the destination address for the shipment using the provided GHN district, and ward information from the address creation response
        const toDistrict: GhnDistrict =
          createNewAddressForOrderResponseDto.orderAddressInGHN.toDistrict;
        const toWard: GhnWard =
          createNewAddressForOrderResponseDto.orderAddressInGHN.toWard;

        // Lấy ra thông tin chi chi tiết shop office từ ghnShopId
        const ghnShopList = await ghnShops.getShopList();
        const ghnShopInfo = ghnShops.getShopInfo(ghnConfig.shopId, ghnShopList);

        // define the shop's address information in ghn system using the shop office's GHN province, district, and ward information
        // Retrieve all available provinces from GHN system
        const GHNProvinces = await ghn.address.getProvinces();

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

        if (!districtsOfFromProvince || districtsOfFromProvince.length === 0) {
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
            fromDistrict.DistrictID,
            toDistrict.DistrictID,
          )
        )[0];
        this.logger.log(
          `Found service: ${service?.short_name}. From district ${fromDistrict.DistrictID} to district ${toDistrict.DistrictID}`,
        );

        // Tính phí vận chuyển
        const fee = await ghn.calculateFee.calculateShippingFee({
          to_district_id: toDistrict.DistrictID,
          to_ward_code: toWard.WardCode,
          service_type_id: service.service_type_id,
          from_district_id: fromDistrict.DistrictID,
          from_ward_code: fromWard.WardCode,

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
            from_district_id: fromDistrict.DistrictID,
            from_ward_code: fromWard.WardCode,
          });

        packages[ghnShopId].ghnShopId = Number(ghnShopId);
        packages[ghnShopId].ghnShopDetail = ghnShopInfo;
        packages[ghnShopId].ghnProvinceName = fromProvince.ProvinceName;
        packages[ghnShopId].ghnDistrictName = fromDistrict.DistrictName;
        packages[ghnShopId].ghnWardName = fromWard.WardName;
        packages[ghnShopId].shippingFee = fee.total;
        packages[ghnShopId].shippingService = service;
        packages[ghnShopId].from_district_id = fromDistrict.DistrictID;
        packages[ghnShopId].from_ward_code = fromWard.WardCode;
        packages[ghnShopId].to_district_id = toDistrict.DistrictID;
        packages[ghnShopId].to_ward_code = toWard.WardCode;
        packages[ghnShopId].expectedDeliveryTime = expectedDeliveryTime;
      }

      this.logger.log('Previewed shipping fee for packages successfully');
      return packages;
    } catch (error) {
      this.logger.log('Error previewing shipping fee for packages', error);
      throw new BadRequestException(
        'Failed to preview shipping fee for packages',
      );
    }
  }
}
