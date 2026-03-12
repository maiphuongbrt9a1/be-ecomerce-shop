import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Shipments } from '@prisma/client';
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
} from '@/helpers/types/types';
import {
  formatMediaFieldWithLoggingForShipments,
  GHNShops,
} from '@/helpers/utils';
import Ghn from 'giaohangnhanh';
import { GhnDistrict, GhnWard } from '@/helpers/types/ghn-address';
import { SecondCreateOrderItemsDto } from '@/orders/dto/create-order.dto';
import {
  CalculateExpectedDeliveryTimeResponse,
  GetServiceResponse,
} from '@/helpers/types/calculate-shipping-fee';
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

  async previewShippingFeeForOrder(
    orderItems: SecondCreateOrderItemsDto[],
    createNewAddressForOrderResponseDto: createNewAddressForOrderResponseDto,
  ): Promise<PackagesForShipping> {
    try {
      // hàm này chỉ nhận danh sách các order items và phải trả về package
      // package đã được gán thông tin phí vận chuyển GHN,
      // dịch vụ vận chuyển GHN, thời gian dự kiến giao hàng,
      // và các thông tin cần thiết khác để tạo đơn hàng trên GHN.

      // Validate input: orderItems must not be empty
      if (!orderItems || orderItems.length === 0) {
        this.logger.error(
          'Order items list is empty. Cannot preview shipping fee without order items.',
        );
        throw new BadRequestException(
          'Order items list cannot be empty for shipping fee preview',
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

      packages[ghnConfig.shopId] = {
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
              },
            },
          },
        },
      );

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
          this.logger.log(
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

        // add order item to corresponding package

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

        packages[ghnConfig.shopId].packageItemsForGHNCreateNewOrderRequest.push(
          itemDetailForGHNCreateNewOrderRequest,
        );

        packages[ghnConfig.shopId].packageItems.push(itemDetail);

        packages[ghnConfig.shopId].totalWeight +=
          item.quantity * productVariant.variantWeight;

        packages[ghnConfig.shopId].totalHeight +=
          item.quantity * productVariant.variantHeight;

        packages[ghnConfig.shopId].maxLength = Math.max(
          packages[ghnConfig.shopId].maxLength,
          productVariant.variantLength,
        );

        packages[ghnConfig.shopId].maxWidth = Math.max(
          packages[ghnConfig.shopId].maxWidth,
          productVariant.variantWidth,
        );
      }

      this.logger.log(`Successfully grouped order items into packages.`);

      // Phần 2: Code từ đây trở xuống là code xử lý thông tin về phí vận chuyển GHN,
      // dịch vụ vận chuyển GHN,
      // và thời gian dự kiến giao hàng.
      // và trả về package đã được gán đầy đủ thông tin về vận chuyển GHN.

      // define the dimensions and weight for the package to be shipped
      const totalWeightForOnePackage = packages[ghnConfig.shopId].totalWeight;
      const totalHeightForOnePackage = packages[ghnConfig.shopId].totalHeight;
      const maxLengthForOnePackage = packages[ghnConfig.shopId].maxLength;
      const maxWidthForOnePackage = packages[ghnConfig.shopId].maxWidth;

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

      packages[ghnConfig.shopId].ghnShopId = Number(ghnConfig.shopId);
      packages[ghnConfig.shopId].ghnShopDetail = ghnShopInfo;
      packages[ghnConfig.shopId].ghnProvinceName = fromProvince.ProvinceName;
      packages[ghnConfig.shopId].ghnDistrictName = fromDistrict.DistrictName;
      packages[ghnConfig.shopId].ghnWardName = fromWard.WardName;
      packages[ghnConfig.shopId].shippingFee = fee.total;
      packages[ghnConfig.shopId].shippingService = service;
      packages[ghnConfig.shopId].from_district_id = fromDistrict.DistrictID;
      packages[ghnConfig.shopId].from_ward_code = fromWard.WardCode;
      packages[ghnConfig.shopId].to_district_id = toDistrict.DistrictID;
      packages[ghnConfig.shopId].to_ward_code = toWard.WardCode;
      packages[ghnConfig.shopId].expectedDeliveryTime = expectedDeliveryTime;

      this.logger.log('Previewed shipping fee for packages successfully');
      return packages;
    } catch (error) {
      this.logger.error('Error previewing shipping fee for packages', error);
      throw new BadRequestException(
        'Failed to preview shipping fee for packages',
      );
    }
  }
}
