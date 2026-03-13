import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  DiscountType,
  Prisma,
  Shipments,
  VoucherStatus,
  Vouchers,
} from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import {
  createNewAddressForOrderResponseDto,
  GHNShopDetail,
  OrdersWithFullInformationInclude,
  PackageItemDetail,
  PackageItemDetailForGHNCreateNewOrderRequest,
  PackagesForShipping,
  ShipmentsWithFullInformation,
  UserVoucherDetailInformation,
} from '@/helpers/types/types';
import {
  calculateDiscountAmount,
  createPackageChecksum,
  formatMediaFieldWithLoggingForShipments,
  GHNShops,
  isVoucherWithinUsageLimit,
} from '@/helpers/utils';
import Ghn from 'giaohangnhanh';
import { GhnDistrict, GhnWard } from '@/helpers/types/ghn-address';
import { SecondCreateOrderItemsDto } from '@/orders/dto/create-order.dto';
import {
  CalculateExpectedDeliveryTimeResponse,
  GetServiceResponse,
} from '@/helpers/types/calculate-shipping-fee';
import { ProductVariantWithAllRelatedVouchers } from '@/helpers/types/productVariant-with-all-related-vouchers';

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
      this.logger.error('Error creating shipment', error);
      throw new BadRequestException('Failed to create shipment');
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
      this.logger.error('Error fetching shipments', error);
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
      this.logger.error('Error fetching shipment', error);
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
      this.logger.error('Error updating shipment', error);
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
      this.logger.error('Error deleting shipment', error);
      throw new BadRequestException('Failed to delete shipment');
    }
  }

  async previewShippingFeeAndDiscountForEachOrderItemInOrder(
    orderItems: SecondCreateOrderItemsDto[],
    createNewAddressForOrderResponseDto: createNewAddressForOrderResponseDto,
  ): Promise<PackagesForShipping> {
    try {
      // hàm này chỉ nhận danh sách các order items và phải trả về package
      // package đã được gán thông tin phí vận chuyển GHN,
      // dịch vụ vận chuyển GHN, thời gian dự kiến giao hàng,
      // và các thông tin cần thiết khác để tạo đơn hàng trên GHN.
      // các giá trị liên quan đến giá của của từng item, của cả package đã được tính ở đây.
      // các voucher cho từng item và cho cả package cũng được áp dụng ở đây
      // và phản ánh vào giá của từng item và tổng giá của package.

      // Validate input: orderItems must not be empty
      if (!orderItems || orderItems.length === 0) {
        this.logger.error(
          'Order items list is empty. Cannot preview shipping fee without order items.',
        );
        throw new BadRequestException(
          'Order items list cannot be empty for shipping fee preview',
        );
      }

      if (
        !createNewAddressForOrderResponseDto ||
        !createNewAddressForOrderResponseDto.orderAddressInGHN ||
        !createNewAddressForOrderResponseDto.orderAddressInDb
      ) {
        this.logger.error(
          'Invalid address information provided for shipping fee preview.',
        );
        throw new BadRequestException(
          'Invalid address information provided for shipping fee preview.',
        );
      }

      if (!createNewAddressForOrderResponseDto.orderAddressInDb.userId) {
        this.logger.error(
          'User Id information must be provided for shipping fee preview.',
        );
        throw new BadRequestException(
          'User Id information must be provided for shipping fee preview.',
        );
      }

      // init ghn config
      const ghnConfig = {
        token: process.env.GHN_TOKEN!, // Thay bằng token của bạn
        shopId: Number(process.env.GHN_SHOP1_ID!), // Thay bằng shopId của bạn
        host: process.env.GHN_HOST!,
        trackingHost: process.env.GHN_TRACKING_HOST!,
        testMode: process.env.GHN_TEST_MODE === 'true', // Bật chế độ test sẽ ghi đè tất cả host thành môi trường sandbox
      };
      const ghn = new Ghn(ghnConfig);
      const ghnShops = new GHNShops(ghnConfig);

      // Phần 1: xử lý việc tạo gói hàng từ danh sách các order items ở đây.
      const packages: PackagesForShipping = {};
      const orderDate = new Date();
      let productVariants: ProductVariantWithAllRelatedVouchers[] = [];
      let userVouchers: UserVoucherDetailInformation[] = [];

      const userExists = await this.prismaService.user.count({
        where: {
          id: createNewAddressForOrderResponseDto.orderAddressInDb.userId,
        },
      });

      if (!userExists) {
        this.logger.error(
          'User information not found for the provided user ID.',
        );
        throw new NotFoundException('User information not found.');
      }

      userVouchers = await this.prismaService.userVouchers.findMany({
        where: {
          userId: createNewAddressForOrderResponseDto.orderAddressInDb.userId,
          voucherStatus: VoucherStatus.SAVED,
          voucher: {
            isActive: true,
            validFrom: { lte: orderDate },
            validTo: { gte: orderDate },
            OR: [{ usageLimit: null }, { usageLimit: { gt: 0 } }],
          },
        },
        include: {
          voucher: true,
        },
      });

      userVouchers = userVouchers.filter((uv) =>
        isVoucherWithinUsageLimit(uv.voucher),
      );

      // Initialize checksum for the package,
      // can be calculated later based on package contents and GHN requirements
      packages[ghnConfig.shopId] = {
        checksumInformation: {
          checksumIdInDB: BigInt(0),
          checksumData: '',
        },
        PackageDetail: {
          packageItems: [] as PackageItemDetail[],
          packageItemsForGHNCreateNewOrderRequest:
            [] as PackageItemDetailForGHNCreateNewOrderRequest[],
          userVoucher: null,
          subTotalPriceForPackage: 0,
          specialUserDiscountAmountForPackage: 0,
          totalPriceForPackage: 0,
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
        },
      };

      const productVariantIdList = orderItems.map((item) =>
        BigInt(item.productVariantId),
      );

      // Prisma cannot compare two columns (timesUsed < usageLimit) in a WHERE clause.
      // Strategy: fetch vouchers that are active + within date + (unlimited OR has a limit);
      // then post-filter to discard vouchers whose timesUsed has reached usageLimit.
      const voucherWhereFilter: Prisma.VouchersWhereInput = {
        isActive: true,
        validFrom: { lte: orderDate },
        validTo: { gte: orderDate },
        OR: [
          { usageLimit: null }, // unlimited vouchers
          { usageLimit: { gt: 0 } }, // limited vouchers (timesUsed check done below)
        ],
      };

      productVariants = await this.prismaService.productVariants.findMany({
        where: { id: { in: productVariantIdList } },
        include: {
          voucher: { where: voucherWhereFilter },
          product: {
            include: {
              voucher: { where: voucherWhereFilter },
              category: {
                include: {
                  voucher: { where: voucherWhereFilter },
                },
              },
            },
          },
        },
      });

      productVariants = productVariants.map((pv) => ({
        ...pv,
        voucher: isVoucherWithinUsageLimit(pv.voucher) ? pv.voucher : null,
        product: {
          ...pv.product,
          voucher: isVoucherWithinUsageLimit(pv.product.voucher)
            ? pv.product.voucher
            : null,
          category: pv.product.category
            ? {
                ...pv.product.category,
                voucher: isVoucherWithinUsageLimit(pv.product.category.voucher)
                  ? pv.product.category.voucher
                  : null,
              }
            : null,
        },
      }));

      if (!productVariants || productVariants.length === 0) {
        this.logger.error(
          'Product variants not found for the provided productVariant IDs.',
        );
        throw new NotFoundException(
          'Product variants not found for the provided productVariant IDs.',
        );
      }

      // Create a Map for O(1) lookup by ID
      const productVariantMap = new Map(
        productVariants.map((pv) => [pv.id.toString(), pv]),
      );

      for (const item of orderItems) {
        const productVariant = productVariantMap.get(
          item.productVariantId.toString(),
        );

        // check order items is stock or out of stock
        // if order items are out of stock, throw error
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

        // add calculate discount for each order item here
        let appliedVoucher: Vouchers | null = null;
        let appliedDiscountValue = 0;
        let appliedDiscountType: DiscountType = DiscountType.FIXED_AMOUNT;
        let appliedDiscountDescription = 'No discount applied';
        let totalDiscountValue = 0;

        if (productVariant.voucher) {
          appliedVoucher = productVariant.voucher;
        } else if (productVariant.product.voucher) {
          appliedVoucher = productVariant.product.voucher;
        } else if (productVariant.product.category?.voucher) {
          appliedVoucher = productVariant.product.category?.voucher;
        }

        if (appliedVoucher) {
          appliedDiscountValue = appliedVoucher.discountValue;
          appliedDiscountType = appliedVoucher.discountType;

          if (appliedVoucher.description) {
            appliedDiscountDescription = appliedVoucher.description;
          }

          if (appliedDiscountType === DiscountType.FIXED_AMOUNT) {
            totalDiscountValue = appliedDiscountValue * item.quantity;
          } else if (appliedDiscountType === DiscountType.PERCENTAGE) {
            totalDiscountValue =
              (productVariant.price * item.quantity * appliedDiscountValue) /
              100;
          }
        }

        // add order item to corresponding package

        const itemDetail: PackageItemDetail = {
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          unitPrice: productVariant.price,
          appliedVoucher: appliedVoucher,
          discountDescription: appliedDiscountDescription,
          discountType: appliedDiscountType,
          discountValue: appliedDiscountValue,
          totalDiscountAmount: totalDiscountValue,
          subTotalPrice: productVariant.price * item.quantity,
          totalPrice: Math.max(
            0,
            productVariant.price * item.quantity - totalDiscountValue,
          ),
          currencyUnit: productVariant.currencyUnit,
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
            price: itemDetail.totalPrice,
            length: productVariant.variantLength,
            width: productVariant.variantWidth,
            height: productVariant.variantHeight,
            weight: productVariant.variantWeight,
            category: {
              level1: productVariant.product.category?.name || 'Unknown',
            },
          };

        packages[
          ghnConfig.shopId
        ].PackageDetail.packageItemsForGHNCreateNewOrderRequest.push(
          itemDetailForGHNCreateNewOrderRequest,
        );

        packages[ghnConfig.shopId].PackageDetail.packageItems.push(itemDetail);

        packages[ghnConfig.shopId].PackageDetail.totalWeight +=
          item.quantity * productVariant.variantWeight;

        packages[ghnConfig.shopId].PackageDetail.totalHeight +=
          item.quantity * productVariant.variantHeight;

        packages[ghnConfig.shopId].PackageDetail.maxLength = Math.max(
          packages[ghnConfig.shopId].PackageDetail.maxLength,
          productVariant.variantLength,
        );

        packages[ghnConfig.shopId].PackageDetail.maxWidth = Math.max(
          packages[ghnConfig.shopId].PackageDetail.maxWidth,
          productVariant.variantWidth,
        );
      }

      // Apply best user voucher at order level (non-stacking with item-level vouchers).
      // Base amount for this voucher is subtotal after item-level discounts.
      const packageSubTotal = packages[
        ghnConfig.shopId
      ].PackageDetail.packageItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );

      let bestUserVoucher: UserVoucherDetailInformation | null = null;
      let bestDiscountAmount = 0;

      for (const userVoucher of userVouchers) {
        const candidateDiscount = Math.min(
          packageSubTotal,
          calculateDiscountAmount(userVoucher.voucher, packageSubTotal),
        );
        if (candidateDiscount > bestDiscountAmount) {
          bestDiscountAmount = candidateDiscount;
          bestUserVoucher = userVoucher;
        }
      }

      packages[ghnConfig.shopId].PackageDetail.userVoucher = bestUserVoucher;
      packages[ghnConfig.shopId].PackageDetail.subTotalPriceForPackage =
        packageSubTotal;
      packages[
        ghnConfig.shopId
      ].PackageDetail.specialUserDiscountAmountForPackage = bestDiscountAmount;

      this.logger.log(`Successfully grouped order items into packages.`);

      // Phần 2: Code từ đây trở xuống là code xử lý thông tin về phí vận chuyển GHN,
      // dịch vụ vận chuyển GHN,
      // và thời gian dự kiến giao hàng.
      // và trả về package đã được gán đầy đủ thông tin về vận chuyển GHN.

      // define the dimensions and weight for the package to be shipped
      const totalWeightForOnePackage =
        packages[ghnConfig.shopId].PackageDetail.totalWeight;
      const totalHeightForOnePackage =
        packages[ghnConfig.shopId].PackageDetail.totalHeight;
      const maxLengthForOnePackage =
        packages[ghnConfig.shopId].PackageDetail.maxLength;
      const maxWidthForOnePackage =
        packages[ghnConfig.shopId].PackageDetail.maxWidth;

      // define the destination address for the shipment using the provided GHN district, and ward information from the address creation response
      const toDistrict: GhnDistrict =
        createNewAddressForOrderResponseDto.orderAddressInGHN.toDistrict;
      const toWard: GhnWard =
        createNewAddressForOrderResponseDto.orderAddressInGHN.toWard;

      // Lấy ra thông tin chi chi tiết ghn shop office từ ghnShopId
      const ghnShopList = await ghnShops.getShopList();
      const ghnShopInfo = ghnShops.getShopInfo(ghnConfig.shopId, ghnShopList);

      // define the shop's address information in ghn system using the shop office's GHN province, district, and ward information
      // Retrieve all available provinces from GHN system
      const GHNProvinces = await ghn.address.getProvinces();

      const fromProvince = GHNProvinces.find(
        (p) => p.ProvinceID == Number(process.env.GHN_SHOP1_PROVINCE_ID!),
      );

      if (!fromProvince) {
        this.logger.error(
          `Province with ID ${process.env.GHN_SHOP1_PROVINCE_ID} not found for shop office with GHN shop ID ${ghnConfig.shopId}`,
        );
        throw new NotFoundException(
          `Province with ID ${process.env.GHN_SHOP1_PROVINCE_ID} not found for shop office with GHN shop ID ${ghnConfig.shopId}`,
        );
      }

      const districtsOfFromProvince = await ghn.address.getDistricts(
        fromProvince.ProvinceID,
      );

      if (!districtsOfFromProvince || districtsOfFromProvince.length === 0) {
        this.logger.error(
          `Districts not found for province with ID ${process.env.GHN_SHOP1_PROVINCE_ID}`,
        );
        throw new NotFoundException(
          `Districts not found for province with ID ${process.env.GHN_SHOP1_PROVINCE_ID}`,
        );
      }

      const fromDistrict = districtsOfFromProvince.find(
        (d) => d.DistrictID == Number(ghnShopInfo.district_id),
      );

      if (!fromDistrict) {
        this.logger.error(
          `District with ID ${ghnShopInfo.district_id} not found for shop office with GHN shop ID ${ghnConfig.shopId}`,
        );
        throw new NotFoundException(
          `District with ID ${ghnShopInfo.district_id} not found for shop office with GHN shop ID ${ghnConfig.shopId}`,
        );
      }

      const wardsOfFromDistrict = await ghn.address.getWards(
        fromDistrict.DistrictID,
      );

      if (!wardsOfFromDistrict || wardsOfFromDistrict.length === 0) {
        this.logger.error(
          `Wards not found for district with ID ${ghnShopInfo.district_id}`,
        );
        throw new NotFoundException(
          `Wards not found for district with ID ${ghnShopInfo.district_id}`,
        );
      }

      const fromWard = wardsOfFromDistrict.find(
        (w) => w.WardCode == ghnShopInfo.ward_code,
      );

      if (!fromWard) {
        this.logger.error(
          `Ward with code ${ghnShopInfo.ward_code} not found for shop office with GHN shop ID ${ghnConfig.shopId}`,
        );
        throw new NotFoundException(
          `Ward with code ${ghnShopInfo.ward_code} not found for shop office with GHN shop ID ${ghnConfig.shopId}`,
        );
      }

      // Lấy dịch vụ vận chuyển đầu tiên trong danh sách dịch vụ có sẵn (hard code)
      const serviceList = await ghn.calculateFee.getServiceList(
        fromDistrict.DistrictID,
        toDistrict.DistrictID,
      );

      if (!serviceList || serviceList.length === 0) {
        this.logger.error(
          `No shipping service available from district ${fromDistrict.DistrictID} to district ${toDistrict.DistrictID}`,
        );
        throw new NotFoundException(
          `No shipping service available for route from district ${fromDistrict.DistrictID} to district ${toDistrict.DistrictID}. Destination may not be serviceable.`,
        );
      }

      const service = serviceList[0];
      this.logger.log(
        `Found service: ${service.short_name}. From district ${fromDistrict.DistrictID} to district ${toDistrict.DistrictID}`,
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

      packages[ghnConfig.shopId].PackageDetail.ghnShopId = Number(
        ghnConfig.shopId,
      );
      packages[ghnConfig.shopId].PackageDetail.ghnShopDetail = ghnShopInfo;
      packages[ghnConfig.shopId].PackageDetail.ghnProvinceName =
        fromProvince.ProvinceName;
      packages[ghnConfig.shopId].PackageDetail.ghnDistrictName =
        fromDistrict.DistrictName;
      packages[ghnConfig.shopId].PackageDetail.ghnWardName = fromWard.WardName;
      packages[ghnConfig.shopId].PackageDetail.shippingFee = fee.total;
      packages[ghnConfig.shopId].PackageDetail.shippingService = service;
      packages[ghnConfig.shopId].PackageDetail.from_district_id =
        fromDistrict.DistrictID;
      packages[ghnConfig.shopId].PackageDetail.from_ward_code =
        fromWard.WardCode;
      packages[ghnConfig.shopId].PackageDetail.to_district_id =
        toDistrict.DistrictID;
      packages[ghnConfig.shopId].PackageDetail.to_ward_code = toWard.WardCode;
      packages[ghnConfig.shopId].PackageDetail.expectedDeliveryTime =
        expectedDeliveryTime;
      packages[ghnConfig.shopId].PackageDetail.totalPriceForPackage =
        packageSubTotal + fee.total - bestDiscountAmount;

      // Phần 3: Tạo checksum cho package dựa trên thông tin của package và yêu cầu của GHN.
      // Checksum này sẽ được sử dụng khi tạo đơn hàng và gọi api lên GHN để đảm bảo tính toàn vẹn của dữ liệu.
      // the user phải gửi lại nguyên vẹn package khi tạo order
      // server chỉ kiểm tra tính toàn vẹn của package
      // thông qua checksum mà không cần phải lo lắng về việc package bị thay đổi thông tin gì bên phía client
      // (vì nếu có thay đổi thì checksum sẽ không khớp và order creation sẽ thất bại)
      // Tất cả là vì hàm này quá lớn và mất thời gian để tính toàn bộ thông tin của package,
      // nên mình muốn tránh việc phải tính đi tính lại nhiều lần (vừa preview fee, vừa tạo order)
      // check sum sẽ được lưu xuống một bảng tạm trong database để dùng cho việc tạo order sau này,
      // và sẽ có cơ chế tự động xóa sau một khoảng thời gian nhất định để tránh rác database

      const secretKeyForCreateChecksum = process.env.PACKAGE_CHECKSUM_SECRET;
      if (!secretKeyForCreateChecksum) {
        this.logger.error(
          'Secret key for creating package checksum is not defined in environment variables.',
        );
        throw new InternalServerErrorException(
          'Server configuration error: missing secret key for creating package checksum.',
        );
      }

      const payloadForCreateChecksum = packages[ghnConfig.shopId].PackageDetail;
      const checksumData = createPackageChecksum(
        payloadForCreateChecksum,
        secretKeyForCreateChecksum,
      );

      packages[ghnConfig.shopId].checksumInformation.checksumData =
        checksumData;

      const checksumRecord = await this.prismaService.packageChecksums.create({
        data: {
          checksumData: checksumData,
          ghnShopId: ghnConfig.shopId,
        },
      });

      if (!checksumRecord) {
        this.logger.error(
          'Failed to create checksum record in database for package.',
        );
        throw new InternalServerErrorException(
          'Failed to create checksum record for package. Please try again.',
        );
      }

      packages[ghnConfig.shopId].checksumInformation.checksumIdInDB = BigInt(
        checksumRecord.id,
      );

      this.logger.log('Previewed shipping fee for packages successfully');
      return packages;
    } catch (error) {
      this.logger.error('Error previewing shipping fee for packages', error);
      // Re-throw known HTTP exceptions (e.g. NotFoundException) without wrapping them
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(
        'Failed to preview shipping fee for packages',
      );
    }
  }
}
