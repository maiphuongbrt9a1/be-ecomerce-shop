import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { OrderItems, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { OrderItemsWithVariantAndMediaInformation } from '@/helpers/types/types';
import { formatMediaFieldWithLogging } from '@/helpers/utils';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Injectable()
export class OrderItemsService {
  private readonly logger = new Logger(OrderItemsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  /**
   * Creates a new order item within an order.
   *
   * This method performs the following operations:
   * 1. Creates order item record in database
   * 2. Validates successful creation
   * 3. Retrieves full order item with product variant and media
   * 4. Formats media URLs to full HTTPS URLs via AwsS3Service
   * 5. Logs successful creation
   * 6. Returns order item with complete product information
   *
   * @param {CreateOrderItemDto} createOrderItemDto - The order item data containing:
   *   - orderId (parent order reference)
   *   - productVariantId (specific product variant)
   *   - quantity (number of items)
   *   - priceAtPurchase (price at time of order)
   *   - discount (optional)
   *
   * @returns {Promise<OrderItemsWithVariantAndMediaInformation>} The created order item with:
   *   - Order item ID, quantity, price
   *   - Product variant details (name, SKU, size, color)
   *   - Media array with full HTTPS URLs
   *   - Discount information
   *   - Created timestamp
   *
   * @throws {BadRequestException} If order item creation fails or item not found after creation
   * @throws {NotFoundException} If order item not found after initial creation
   *
   * @remarks
   * - Media URLs are converted from S3 keys to full public URLs
   * - Captures price at purchase time for historical accuracy
   * - Links to specific product variants (size/color combinations)
   * - Used during order placement and checkout
   */
  async create(
    createOrderItemDto: CreateOrderItemDto,
  ): Promise<OrderItemsWithVariantAndMediaInformation> {
    try {
      const result = await this.prismaService.orderItems.create({
        data: { ...createOrderItemDto },
      });

      if (!result) {
        throw new BadRequestException('Failed to create order item');
      }

      const returnResult = await this.prismaService.orderItems.findUnique({
        include: {
          productVariant: {
            include: {
              media: true,
            },
          },
        },
        where: { id: result.id },
      });

      if (!returnResult) {
        throw new NotFoundException('Order item not found after creation');
      }

      // generate full http url for media files
      if (
        returnResult.productVariant &&
        returnResult.productVariant.media &&
        returnResult.productVariant.media.length > 0
      ) {
        returnResult.productVariant.media = formatMediaFieldWithLogging(
          returnResult.productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'order item',
          returnResult.id,
          this.logger,
        );
      }

      this.logger.log(`Order item created with ID: ${result.id}`);
      return returnResult;
    } catch (error) {
      this.logger.error('Failed to create order item: ', error);
      throw new BadRequestException('Failed to create order item');
    }
  }

  /**
   * Retrieves paginated list of all order items with product variant and media information.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries order items with product variant and media includes
   * 3. Sorts results by order item ID ascending
   * 4. Formats all media URLs to full HTTPS URLs for each item
   * 5. Returns paginated order item data
   * 6. Logs successful retrieval
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of order items per page
   *
   * @returns {Promise<OrderItemsWithVariantAndMediaInformation[] | []>} Array of order items or empty array:
   *   - Order item ID, quantity, price at purchase
   *   - Product variant details (name, SKU, size, color)
   *   - Media array with full HTTPS URLs
   *   - Order ID reference
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If order items retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by order item ID in ascending order
   * - All media URLs are converted from S3 keys to full public URLs
   * - Returns empty array if no order items exist
   * - Used for admin order management and reporting
   */
  async findAll(
    page: number,
    perPage: number,
  ): Promise<OrderItemsWithVariantAndMediaInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrderItemsWithVariantAndMediaInformation,
        Prisma.OrderItemsFindManyArgs
      >(
        this.prismaService.orderItems,
        {
          include: {
            productVariant: {
              include: {
                media: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      for (let index = 0; index < result.data.length; index++) {
        const orderItem = result.data[index];
        if (
          orderItem.productVariant &&
          orderItem.productVariant.media &&
          orderItem.productVariant.media.length > 0
        ) {
          orderItem.productVariant.media = formatMediaFieldWithLogging(
            orderItem.productVariant.media,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'order item',
            orderItem.id,
            this.logger,
          );
        }
      }

      this.logger.log(
        `Fetched all order items - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all order items: ', error);
      throw new BadRequestException('Failed to fetch all order items');
    }
  }

  /**
   * Retrieves a single order item with product variant and media information by ID.
   *
   * This method performs the following operations:
   * 1. Queries order item by ID with product variant and media includes
   * 2. Validates order item exists
   * 3. Formats media URLs to full HTTPS URLs via AwsS3Service
   * 4. Logs successful retrieval
   * 5. Returns order item with complete product information
   *
   * @param {number} id - The order item ID to retrieve
   *
   * @returns {Promise<OrderItemsWithVariantAndMediaInformation | null>} The order item with:
   *   - Order item ID, quantity, price at purchase
   *   - Product variant details (name, SKU, size, color)
   *   - Media array with full HTTPS URLs
   *   - Order ID reference, discount
   *   - Created/updated timestamps
   *
   * @throws {NotFoundException} If order item not found
   * @throws {BadRequestException} If order item retrieval fails
   *
   * @remarks
   * - Returns null if order item doesn't exist
   * - Media URLs are converted from S3 keys to full public URLs
   * - Used for viewing specific order item details
   * - Includes complete product variant information for display
   */
  async findOne(
    id: number,
  ): Promise<OrderItemsWithVariantAndMediaInformation | null> {
    try {
      const result = await this.prismaService.orderItems.findFirst({
        where: { id: id },
        include: {
          productVariant: {
            include: {
              media: true,
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundException('Order item not found!');
      }

      if (
        result.productVariant &&
        result.productVariant.media &&
        result.productVariant.media.length > 0
      ) {
        result.productVariant.media = formatMediaFieldWithLogging(
          result.productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'order item',
          result.id,
          this.logger,
        );
      }

      this.logger.log(`Fetched order item with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch order item: ', error);
      throw new BadRequestException('Failed to fetch order item');
    }
  }

  /**
   * Updates an existing order item (typically quantity or price adjustments).
   *
   * This method performs the following operations:
   * 1. Updates order item in database
   * 2. Validates successful update
   * 3. Retrieves updated order item with product variant and media
   * 4. Formats media URLs to full HTTPS URLs via AwsS3Service
   * 5. Logs successful update
   * 6. Returns updated order item with complete information
   *
   * @param {number} id - The order item ID to update
   * @param {UpdateOrderItemDto} updateOrderItemDto - The update data containing:
   *   - quantity (optional)
   *   - priceAtPurchase (optional)
   *   - discount (optional)
   *   - productVariantId (optional, if changing variant)
   *
   * @returns {Promise<OrderItemsWithVariantAndMediaInformation>} The updated order item with:
   *   - Order item ID, updated quantity/price
   *   - Product variant details with full information
   *   - Media array with full HTTPS URLs
   *   - All updated timestamps
   *
   * @throws {BadRequestException} If order item update fails or item not found after update
   * @throws {NotFoundException} If order item not found after initial update
   *
   * @remarks
   * - Media URLs are converted from S3 keys to full public URLs
   * - Used for order modifications before fulfillment
   * - Should validate business rules (e.g., no updates after shipment)
   * - Updates affect order total calculations
   */
  async update(
    id: number,
    updateOrderItemDto: UpdateOrderItemDto,
  ): Promise<OrderItemsWithVariantAndMediaInformation> {
    try {
      const result = await this.prismaService.orderItems.update({
        where: { id: id },
        data: { ...updateOrderItemDto },
      });

      if (!result) {
        throw new BadRequestException('Failed to update order item');
      }

      const returnResult = await this.prismaService.orderItems.findUnique({
        include: {
          productVariant: {
            include: {
              media: true,
            },
          },
        },
        where: { id: result.id },
      });

      if (!returnResult) {
        throw new NotFoundException('Order item not found after update');
      }

      // generate full http url for media files
      if (
        returnResult.productVariant &&
        returnResult.productVariant.media &&
        returnResult.productVariant.media.length > 0
      ) {
        returnResult.productVariant.media = formatMediaFieldWithLogging(
          returnResult.productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'order item',
          returnResult.id,
          this.logger,
        );
      }

      this.logger.log(`Updated order item with ID: ${id}`);
      return returnResult;
    } catch (error) {
      this.logger.error('Failed to update order item: ', error);
      throw new BadRequestException('Failed to update order item');
    }
  }

  /**
   * Deletes an order item by ID.
   *
   * This method performs the following operations:
   * 1. Logs deletion operation
   * 2. Deletes order item from database
   * 3. Returns deleted order item
   *
   * @param {number} id - The order item ID to delete
   *
   * @returns {Promise<OrderItems>} The deleted order item with basic details (no includes)
   *
   * @throws {BadRequestException} If order item deletion fails
   * @throws {NotFoundException} If order item not found
   *
   * @remarks
   * - This operation is irreversible
   * - Should not delete if order is already fulfilled or shipped
   * - Database cascades handle related record cleanup
   * - Used for order cancellations before fulfillment
   * - Affects order total calculations
   */
  async remove(id: number): Promise<OrderItems> {
    try {
      this.logger.log(`Removing order item with ID: ${id}`);
      return await this.prismaService.orderItems.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error('Failed to remove order item: ', error);
      throw new BadRequestException('Failed to remove order item');
    }
  }
}
