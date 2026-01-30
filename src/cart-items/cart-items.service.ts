import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { CartItems, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { CartItemsWithProductVariantAndMedia } from '@/helpers/types/types';
import { formatMediaFieldWithLogging } from '@/helpers/utils';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Injectable()
export class CartItemsService {
  private readonly logger = new Logger(CartItemsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  /**
   * Creates a new item in the shopping cart.
   *
   * This method performs the following operations:
   * 1. Creates cart item record in database
   * 2. Validates successful creation
   * 3. Retrieves full cart item with product variant and media
   * 4. Formats media URLs to full HTTPS URLs via AwsS3Service
   * 5. Logs successful creation
   * 6. Returns cart item with complete product information
   *
   * @param {CreateCartItemDto} createCartItemDto - The cart item data containing:
   *   - cartId (parent shopping cart reference)
   *   - productVariantId (specific product variant)
   *   - quantity (number of items to add)
   *   - addedAt (timestamp, optional)
   *
   * @returns {Promise<CartItemsWithProductVariantAndMedia>} The created cart item with:
   *   - Cart item ID, quantity
   *   - Product variant details (name, SKU, size, color, price)
   *   - Media array with full HTTPS URLs
   *   - Cart ID reference
   *   - Created timestamp
   *
   * @throws {BadRequestException} If cart item creation fails or item not found after creation
   * @throws {NotFoundException} If cart item not found after initial creation
   *
   * @remarks
   * - Media URLs are converted from S3 keys to full public URLs
   * - Used during "Add to Cart" operations
   * - Links to specific product variants (size/color combinations)
   * - Should check for duplicate items (same variant in same cart)
   */
  async create(
    createCartItemDto: CreateCartItemDto,
  ): Promise<CartItemsWithProductVariantAndMedia> {
    try {
      const result = await this.prismaService.cartItems.create({
        data: { ...createCartItemDto },
      });

      if (!result) {
        throw new BadRequestException('Failed to create cart item');
      }

      const returnResult = await this.prismaService.cartItems.findUnique({
        where: { id: result.id },
        include: {
          productVariant: {
            include: {
              media: true,
            },
          },
        },
      });

      if (!returnResult) {
        throw new NotFoundException('Cart item not found after creation');
      }

      // generate https link for media field
      if (
        returnResult.productVariant &&
        returnResult.productVariant.media &&
        returnResult.productVariant.media.length > 0
      ) {
        returnResult.productVariant.media = formatMediaFieldWithLogging(
          returnResult.productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'cart item',
          returnResult.id,
          this.logger,
        );
      }

      this.logger.log(`Cart item created with ID: ${result.id}`);
      return returnResult;
    } catch (error) {
      this.logger.error('Failed to create cart item: ', error);
      throw new BadRequestException('Failed to create cart item');
    }
  }

  /**
   * Retrieves paginated list of all cart items with product variant and media information.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries cart items with product variant and media includes
   * 3. Sorts results by cart item ID ascending
   * 4. Formats all media URLs to full HTTPS URLs for each item
   * 5. Returns paginated cart item data
   * 6. Logs successful retrieval
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of cart items per page
   *
   * @returns {Promise<CartItemsWithProductVariantAndMedia[] | []>} Array of cart items or empty array:
   *   - Cart item ID, quantity
   *   - Product variant details (name, SKU, size, color, price)
   *   - Media array with full HTTPS URLs
   *   - Cart ID reference
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If cart items retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by cart item ID in ascending order
   * - All media URLs are converted from S3 keys to full public URLs
   * - Returns empty array if no cart items exist
   * - Used for displaying shopping cart contents
   */
  async findAll(
    page: number,
    perPage: number,
  ): Promise<CartItemsWithProductVariantAndMedia[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        CartItemsWithProductVariantAndMedia,
        Prisma.CartItemsFindManyArgs
      >(
        this.prismaService.cartItems,
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

      // generate https link for media field in each cart item
      for (let index = 0; index < result.data.length; index++) {
        const cartItem = result.data[index];
        if (
          cartItem.productVariant &&
          cartItem.productVariant.media &&
          cartItem.productVariant.media.length > 0
        ) {
          cartItem.productVariant.media = formatMediaFieldWithLogging(
            cartItem.productVariant.media,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'cart item',
            cartItem.id,
            this.logger,
          );
        }
      }

      this.logger.log(
        `Fetched all cart items - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all cart items: ', error);
      throw new BadRequestException('Failed to fetch all cart items');
    }
  }

  /**
   * Retrieves a single cart item with product variant and media information by ID.
   *
   * This method performs the following operations:
   * 1. Queries cart item by ID with product variant and media includes
   * 2. Validates cart item exists
   * 3. Formats media URLs to full HTTPS URLs via AwsS3Service
   * 4. Logs successful retrieval
   * 5. Returns cart item with complete product information
   *
   * @param {number} id - The cart item ID to retrieve
   *
   * @returns {Promise<CartItemsWithProductVariantAndMedia | null>} The cart item with:
   *   - Cart item ID, quantity
   *   - Product variant details (name, SKU, size, color, price)
   *   - Media array with full HTTPS URLs
   *   - Cart ID reference
   *   - Created/updated timestamps
   *
   * @throws {NotFoundException} If cart item not found
   * @throws {BadRequestException} If cart item retrieval fails
   *
   * @remarks
   * - Returns null if cart item doesn't exist
   * - Media URLs are converted from S3 keys to full public URLs
   * - Used for viewing specific cart item details
   * - Includes complete product variant information for display
   */
  async findOne(
    id: number,
  ): Promise<CartItemsWithProductVariantAndMedia | null> {
    try {
      const result = await this.prismaService.cartItems.findFirst({
        include: {
          productVariant: {
            include: {
              media: true,
            },
          },
        },
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Cart item not found!');
      }

      // generate https link for media field
      if (
        result.productVariant &&
        result.productVariant.media &&
        result.productVariant.media.length > 0
      ) {
        result.productVariant.media = formatMediaFieldWithLogging(
          result.productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'cart item',
          result.id,
          this.logger,
        );
      }

      this.logger.log(`Fetched cart item with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch cart item with ID ${id}: `, error);
      throw new BadRequestException('Failed to fetch cart item');
    }
  }

  /**
   * Updates an existing cart item (typically quantity changes).
   *
   * This method performs the following operations:
   * 1. Updates cart item in database
   * 2. Validates successful update
   * 3. Retrieves updated cart item with product variant and media
   * 4. Formats media URLs to full HTTPS URLs via AwsS3Service
   * 5. Logs successful update
   * 6. Returns updated cart item with complete information
   *
   * @param {number} id - The cart item ID to update
   * @param {UpdateCartItemDto} updateCartItemDto - The update data containing:
   *   - quantity (optional, most common update)
   *   - productVariantId (optional, if changing variant)
   *
   * @returns {Promise<CartItemsWithProductVariantAndMedia>} The updated cart item with:
   *   - Cart item ID, updated quantity
   *   - Product variant details with full information
   *   - Media array with full HTTPS URLs
   *   - All updated timestamps
   *
   * @throws {BadRequestException} If cart item update fails or item not found after update
   * @throws {NotFoundException} If cart item not found after initial update
   *
   * @remarks
   * - Media URLs are converted from S3 keys to full public URLs
   * - Primarily used for quantity updates (increment/decrement)
   * - Should validate quantity > 0
   * - Used in shopping cart UI for item quantity adjustments
   */
  async update(
    id: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItemsWithProductVariantAndMedia> {
    try {
      const result = await this.prismaService.cartItems.update({
        where: { id: id },
        data: { ...updateCartItemDto },
      });

      if (!result) {
        throw new BadRequestException('Cart item has failed to update!');
      }

      const returnResult = await this.prismaService.cartItems.findUnique({
        where: { id: result.id },
        include: {
          productVariant: {
            include: {
              media: true,
            },
          },
        },
      });

      if (!returnResult) {
        throw new NotFoundException('Cart item not found after updated!');
      }
      // generate https link for media field
      if (
        returnResult.productVariant &&
        returnResult.productVariant.media &&
        returnResult.productVariant.media.length > 0
      ) {
        returnResult.productVariant.media = formatMediaFieldWithLogging(
          returnResult.productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'cart item',
          returnResult.id,
          this.logger,
        );
      }

      this.logger.log(`Updated cart item with ID: ${id}`);
      return returnResult;
    } catch (error) {
      this.logger.error(`Failed to update cart item with ID ${id}: `, error);
      throw new BadRequestException('Failed to update cart item');
    }
  }

  /**
   * Deletes a cart item by ID (removes item from shopping cart).
   *
   * This method performs the following operations:
   * 1. Logs deletion operation
   * 2. Deletes cart item from database
   * 3. Returns deleted cart item
   *
   * @param {number} id - The cart item ID to delete
   *
   * @returns {Promise<CartItems>} The deleted cart item with basic details (no includes)
   *
   * @throws {BadRequestException} If cart item deletion fails
   * @throws {NotFoundException} If cart item not found
   *
   * @remarks
   * - This operation is irreversible
   * - Used when user removes items from shopping cart
   * - Database cascades handle related record cleanup
   * - Common operation during cart management
   */
  async remove(id: number): Promise<CartItems> {
    try {
      this.logger.log(`Removing cart item with ID: ${id}`);
      return await this.prismaService.cartItems.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error(`Failed to remove cart item with ID ${id}: `, error);
      throw new BadRequestException('Failed to remove cart item');
    }
  }
}
