import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Products } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import { formatMediaField, formatMediaFieldWithLogging } from '@/helpers/utils';
import {
  ProductsWithProductVariantsAndTheirMedia,
  ProductVariantsWithMediaInformation,
  ReviewsWithMedia,
} from '@/helpers/types/types';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  /**
   * Creates a new product with associated product variants and media files.
   *
   * This method performs the following operations:
   * 1. Creates a new product in the database with provided data
   * 2. Retrieves the created product with all product variants and media
   * 3. Formats all media URLs to public HTTPS URLs for S3 files
   * 4. Logs the creation operation
   *
   * @param {CreateProductDto} createProductDto - The data transfer object containing product information:
   *   - Product name, description, category, price, stock details
   *   - Any other product-specific properties
   *
   * @returns {Promise<ProductsWithProductVariantsAndTheirMedia>} The created product with all details including:
   *   - Product information (id, name, price, stock)
   *   - All associated product variants
   *   - Media files with formatted public HTTPS URLs
   *
   * @throws {NotFoundException} If product creation fails or product retrieval fails
   * @throws {BadRequestException} If database operation fails
   *
   * @remarks
   * - Media URLs are converted to public HTTPS URLs for S3 access
   * - Validates successful creation before returning data
   * - Includes all product variants and their media in response
   */
  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductsWithProductVariantsAndTheirMedia> {
    try {
      const product = await this.prismaService.products.create({
        data: { ...createProductDto },
      });

      if (!product) {
        throw new NotFoundException('Failed to create product');
      }

      const returnProduct = await this.prismaService.products.findUnique({
        where: { id: product.id },
        include: {
          productVariants: {
            include: {
              media: true,
            },
          },
        },
      });

      if (!returnProduct) {
        throw new NotFoundException('Failed to retrieve created product');
      }

      // generate full http url for media files
      for (let i = 0; i < returnProduct.productVariants.length; i++) {
        const productVariant = returnProduct.productVariants[i];
        productVariant.media = formatMediaFieldWithLogging(
          productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'product variant',
          productVariant.id,
          this.logger,
        );
      }

      this.logger.log(`Product created with ID: ${product.id}`);
      return returnProduct;
    } catch (error) {
      this.logger.log(`Error creating product: ${error}`);
      throw new BadRequestException('Failed to create product');
    }
  }

  /**
   * Retrieves a paginated list of all products with their variants and media.
   *
   * This method performs the following operations:
   * 1. Fetches products from the database with pagination
   * 2. Includes all product variants and their associated media
   * 3. Formats all media URLs to public HTTPS URLs for S3 access
   * 4. Logs pagination details
   *
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of products to retrieve per page
   *
   * @returns {Promise<ProductsWithProductVariantsAndTheirMedia[] | []>} Array of products with details including:
   *   - Product information (id, name, price, stock)
   *   - All product variants for each product
   *   - Media files with formatted public HTTPS URLs
   *   Returns empty array if no products found
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by product ID in ascending order
   * - Media URLs are converted to public HTTPS URLs
   * - Logs media field changes during formatting
   * - Empty array returned for consistency
   */
  async findAll(
    page: number,
    perPage: number,
  ): Promise<ProductsWithProductVariantsAndTheirMedia[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ProductsWithProductVariantsAndTheirMedia,
        Prisma.ProductsFindManyArgs
      >(
        this.prismaService.products,
        {
          include: {
            productVariants: {
              include: {
                media: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full http url for media files of each product variant in products
      for (let i = 0; i < result.data.length; i++) {
        const productVariantList = result.data[i].productVariants;
        for (let j = 0; j < productVariantList.length; j++) {
          const productVariant = productVariantList[j];
          const originalMedia = productVariant.media; // Store original media for comparison
          productVariant.media = formatMediaField(
            productVariant.media,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
          );

          // Check if the media field has changed
          if (originalMedia !== productVariant.media) {
            this.logger.log(
              `Media field changed for product variant ID: ${productVariant.id}`,
            );
          }
        }
      }

      this.logger.log(`Fetched products - Page: ${page}, PerPage: ${perPage}`);
      return result.data;
    } catch (error) {
      this.logger.log(`Error fetching products: ${error}`);
      throw new BadRequestException('Failed to fetch products');
    }
  }

  /**
   * Retrieves a single product by ID with all variants and media information.
   *
   * This method performs the following operations:
   * 1. Queries the database for the product by ID
   * 2. Includes all product variants and their associated media
   * 3. Formats all media URLs to public HTTPS URLs for S3 access
   * 4. Logs retrieval operation and media changes
   *
   * @param {number} id - The unique identifier of the product to retrieve
   *
   * @returns {Promise<ProductsWithProductVariantsAndTheirMedia | null>} The product with all details including:
   *   - Product information (id, name, price, stock)
   *   - All associated product variants
   *   - Media files with formatted public HTTPS URLs
   *   Returns null if product not found
   *
   * @throws {NotFoundException} If product is not found
   * @throws {BadRequestException} If data fetching fails
   *
   * @remarks
   * - Media URLs are converted to public HTTPS URLs
   * - Logs media field changes during formatting for debugging
   * - Includes complete product hierarchy with all variants
   */
  async findOne(
    id: number,
  ): Promise<ProductsWithProductVariantsAndTheirMedia | null> {
    try {
      const product = await this.prismaService.products.findFirst({
        include: {
          productVariants: {
            include: {
              media: true,
            },
          },
        },
        where: { id: id },
      });

      if (!product) {
        throw new NotFoundException('Product not found!');
      }

      // generate full http url for media files
      for (let i = 0; i < product.productVariants.length; i++) {
        const productVariant = product.productVariants[i];
        const originalMedia = productVariant.media; // Store original media for comparison
        productVariant.media = formatMediaField(
          productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
        );

        // Check if the media field has changed
        if (originalMedia !== productVariant.media) {
          this.logger.log(
            `Media field changed for product variant ID: ${productVariant.id}`,
          );
        }
      }

      this.logger.log(`Product fetched with ID: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.log(`Error fetching product with ID ${id}: ${error}`);
      throw new BadRequestException('Failed to fetch product');
    }
  }

  /**
   * Updates an existing product with new information.
   *
   * This method performs the following operations:
   * 1. Updates the product in the database with provided data
   * 2. Retrieves the updated product with all variants and media
   * 3. Formats all media URLs to public HTTPS URLs
   * 4. Logs the update operation
   *
   * @param {number} id - The unique identifier of the product to update
   * @param {UpdateProductDto} updateProductDto - The data transfer object containing product updates:
   *   - May include name, description, price, stock, category, or other properties
   *
   * @returns {Promise<ProductsWithProductVariantsAndTheirMedia>} The updated product with all details including:
   *   - Updated product information
   *   - All associated product variants
   *   - Media files with formatted public HTTPS URLs
   *
   * @throws {BadRequestException} If product update fails
   * @throws {NotFoundException} If product not found after update
   *
   * @remarks
   * - Validates successful update before returning data
   * - Includes all product variants and their media in response
   * - Media URLs are converted to public HTTPS URLs
   */
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductsWithProductVariantsAndTheirMedia> {
    try {
      const product = await this.prismaService.products.update({
        where: { id: id },
        data: { ...updateProductDto },
      });

      if (!product) {
        throw new BadRequestException('Failed to update product');
      }

      const returnProduct = await this.prismaService.products.findUnique({
        where: { id: product.id },
        include: {
          productVariants: {
            include: {
              media: true,
            },
          },
        },
      });

      if (!returnProduct) {
        throw new NotFoundException('Failed to retrieve updated product');
      }

      // generate full http url for media files
      for (let i = 0; i < returnProduct.productVariants.length; i++) {
        const productVariant = returnProduct.productVariants[i];
        productVariant.media = formatMediaFieldWithLogging(
          productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'product variant',
          productVariant.id,
          this.logger,
        );
      }

      this.logger.log(`Product updated with ID: ${product.id}`);
      return returnProduct;
    } catch (error) {
      this.logger.log(`Error updating product with ID ${id}: ${error}`);
      throw new BadRequestException('Failed to update product');
    }
  }

  /**
   * Deletes a product and all its associated data from the database and storage.
   *
   * This method performs the following operations within a database transaction:
   * 1. Retrieves the product with all variants and reviews including their media
   * 2. Deletes all product variants and their associated media files from S3
   * 3. Deletes all reviews and their associated media files from S3
   * 4. Deletes the product record from the database
   * 5. Logs the deletion operation
   *
   * @param {number} id - The unique identifier of the product to delete
   *
   * @returns {Promise<Products>} The deleted product record
   *
   * @throws {NotFoundException} If product is not found
   * @throws {BadRequestException} If deletion fails
   *
   * @remarks
   * - This operation is cascading and will delete all related data
   * - Media files are removed from S3 storage along with database records
   * - Uses database transaction to ensure data consistency
   * - Verify before deletion as this action cannot be easily reversed
   * - Use with caution in production environments
   */
  async remove(id: number): Promise<Products> {
    try {
      this.logger.log(`Deleting product with ID: ${id}`);
      return await this.prismaService.$transaction(async (tx) => {
        const product = await tx.products.findUnique({
          where: { id: id },
          include: {
            productVariants: {
              include: {
                media: true,
              },
            },
            reviews: {
              include: {
                media: true,
              },
            },
          },
        });

        if (!product) {
          throw new NotFoundException('Product not found!');
        }

        if (product.productVariants && product.productVariants.length > 0) {
          for (const variant of product.productVariants) {
            // delete variant
            await tx.productVariants.delete({ where: { id: variant.id } });
            //delete media associated with variant from aws s3
            for (const media of variant.media) {
              await this.awsService.deleteFileFromS3(media.url);
            }
          }
        }

        if (product.reviews && product.reviews.length > 0) {
          for (const review of product.reviews) {
            // delete review
            await tx.reviews.delete({ where: { id: review.id } });
            //delete media associated with review from aws s3
            for (const media of review.media) {
              await this.awsService.deleteFileFromS3(media.url);
            }
          }
        }

        const result = await tx.products.delete({
          where: { id: id },
        });
        this.logger.log(`Product deleted with ID: ${id}`);
        return result;
      });
    } catch (error) {
      this.logger.log(`Error deleting product with ID ${id}: ${error}`);
      throw new BadRequestException('Failed to delete product');
    }
  }

  /**
   * Retrieves all product variants associated with a specific product.
   *
   * This method performs the following operations:
   * 1. Queries the database for all variants of a specific product
   * 2. Includes all media files associated with each variant
   * 3. Formats all media URLs to public HTTPS URLs for S3 access
   * 4. Logs retrieval and media changes
   *
   * @param {number} id - The unique identifier of the product
   *
   * @returns {Promise<ProductVariantsWithMediaInformation[] | []>} Array of product variants including:
   *   - Variant information (id, name, sku, color, size, price, stock)
   *   - Media files with formatted public HTTPS URLs
   *   Returns empty array if no variants found
   *
   * @throws {NotFoundException} If no product variants found
   * @throws {BadRequestException} If data fetching fails
   *
   * @remarks
   * - Media URLs are converted to public HTTPS URLs
   * - Logs media field changes during formatting
   * - Returns all variants for the specified product
   */
  async getAllProductVariantsOfProduct(
    id: number,
  ): Promise<ProductVariantsWithMediaInformation[] | []> {
    try {
      const productVariantsList =
        await this.prismaService.productVariants.findMany({
          include: {
            media: true,
          },
          where: { productId: id },
        });

      if (!productVariantsList || productVariantsList.length === 0) {
        throw new NotFoundException('Product Variants not found!');
      }

      // generate full http url for media files
      for (let i = 0; i < productVariantsList.length; i++) {
        const productVariant = productVariantsList[i];
        const originalMedia = productVariant.media; // Store original media for comparison
        productVariant.media = formatMediaField(
          productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
        );

        // Check if the media field has changed
        if (originalMedia !== productVariant.media) {
          this.logger.log(
            `Media field changed for product variant ID: ${productVariant.id}`,
          );
        }
      }

      this.logger.log(`Product Variants fetched for product ID: ${id}`);
      return productVariantsList;
    } catch (error) {
      this.logger.log(
        `Error fetching product variants for product ID ${id}: ${error}`,
      );
      throw new BadRequestException('Failed to fetch product variants');
    }
  }

  /**
   * Retrieves paginated reviews for a specific product with media files.
   *
   * This method performs the following operations:
   * 1. Fetches paginated reviews for the product from the database
   * 2. Includes all media files associated with each review
   * 3. Formats all media URLs to public HTTPS URLs for S3 access
   * 4. Logs retrieval operation
   *
   * @param {number} id - The unique identifier of the product
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of reviews to retrieve per page
   *
   * @returns {Promise<ReviewsWithMedia[] | []>} Array of reviews with details including:
   *   - Review information (id, rating, comment, author, date)
   *   - Media files with formatted public HTTPS URLs
   *   Returns empty array if no reviews found
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by review ID in ascending order
   * - Media URLs are converted to public HTTPS URLs
   * - Useful for paginated review displays on product pages
   * - Empty array returned for consistency
   */
  async getAllReviewsOfProduct(
    id: number,
    page: number,
    perPage: number,
  ): Promise<ReviewsWithMedia[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ReviewsWithMedia,
        Prisma.ReviewsFindManyArgs
      >(
        this.prismaService.reviews,
        {
          include: { media: true },
          where: { productId: id },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full http url for media files of each review
      for (let i = 0; i < result.data.length; i++) {
        const review = result.data[i];
        review.media = formatMediaFieldWithLogging(
          review.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'Review',
          review.id,
          this.logger,
        );
      }

      this.logger.log(`Reviews fetched for product ID: ${id}`);
      return result.data;
    } catch (error) {
      this.logger.log(`Error fetching reviews for product ID ${id}: ${error}`);
      throw new BadRequestException('Failed to fetch product reviews');
    }
  }
}
