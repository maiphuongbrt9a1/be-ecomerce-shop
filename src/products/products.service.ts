import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Media, Prisma, Products } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import { formatMediaField, formatMediaFieldWithLogging } from '@/helpers/utils';
import {
  Products_And_ProductsMedia_With_ProductVariants_And_ProductVariantsMedia,
  ProductsWithProductsMedia,
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
   * 2. Uploads media files to S3 storage if files are provided
   * 3. Retrieves the created product with all product variants and media
   * 4. Formats all media URLs to public HTTPS URLs for S3 files (for both variants and product)
   * 5. Logs the creation operation
   *
   * @param {Express.Multer.File[]} files - Array of media files to upload for the product
   *   - Files are uploaded to S3 with unique naming based on product ID
   *   - Used for product avatar/image files
   *   - Required to proceed with product creation
   *
   * @param {CreateProductDto} createProductDto - The data transfer object containing product information:
   *   - Product name, description, category, price, stock details
   *   - Any other product-specific properties
   *
   * @param {string} adminId - The ID of the admin creating the product
   *   - Used for tracking which admin uploaded the media files
   *   - Associated with all uploaded media records
   *
   * @returns {Promise<Products_And_ProductsMedia_With_ProductVariants_And_ProductVariantsMedia>} The created product with all details including:
   *   - Product information (id, name, price, stock)
   *   - Product media files with formatted public HTTPS URLs
   *   - All associated product variants
   *   - Variant media files with formatted public HTTPS URLs
   *
   * @throws {NotFoundException} If product creation fails, media upload fails, or product retrieval fails
   * @throws {BadRequestException} If database operation fails
   *
   * @remarks
   * - Media files must be successfully uploaded to S3 before product is considered created
   * - Media URLs are converted to public HTTPS URLs for client access
   * - Validates successful creation and upload before returning data
   * - Includes all product variants and their media in response
   * - All media associations are logged with their respective entity IDs
   */
  async create(
    files: Express.Multer.File[],
    createProductDto: CreateProductDto,
    adminId: string,
  ): Promise<Products_And_ProductsMedia_With_ProductVariants_And_ProductVariantsMedia> {
    try {
      const product = await this.prismaService.products.create({
        data: { ...createProductDto },
      });

      if (!product) {
        throw new NotFoundException('Failed to create product');
      }

      // upload media files for product if have supplied files and create new product successfully
      const mediaForProduct = await this.awsService.uploadManyProductAvatarFile(
        files,
        adminId,
        product.id.toString(),
      );

      if (!mediaForProduct) {
        this.logger.error('Failed to upload product media file');
        throw new NotFoundException('Failed to upload product media file');
      }

      const returnProduct: Products_And_ProductsMedia_With_ProductVariants_And_ProductVariantsMedia | null =
        await this.prismaService.products.findUnique({
          where: { id: product.id },
          include: {
            media: true,
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

      returnProduct.media = formatMediaFieldWithLogging(
        returnProduct.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'product',
        returnProduct.id,
        this.logger,
      );

      this.logger.log(`Product created with ID: ${product.id}`);
      return returnProduct;
    } catch (error) {
      this.logger.error(`Error creating product: ${error}`);
      throw new BadRequestException('Failed to create product');
    }
  }

  /**
   * Retrieves a paginated list of all products with their variants and media.
   *
   * This method performs the following operations:
   * 1. Fetches products from the database with applied pagination
   * 2. Includes all product variants and their associated media for each product
   * 3. Formats all product variant media URLs to public HTTPS URLs
   * 4. Formats all product media URLs to public HTTPS URLs
   * 5. Logs pagination request details and any media field changes
   *
   * @param {number} page - The page number for pagination (1-indexed)
   *   - Must be greater than 0
   *   - First page is page number 1
   *
   * @param {number} perPage - The number of products to retrieve per page
   *   - Defines the pagination limit
   *   - Controls result set size
   *
   * @returns {Promise<Products_And_ProductsMedia_With_ProductVariants_And_ProductVariantsMedia[] | []>} Array of products with details including:
   *   - Product information (id, name, price, stock, etc.)
   *   - Product media files with formatted public HTTPS URLs
   *   - All product variants for each product
   *   - Variant media files with formatted public HTTPS URLs
   *   - Returns empty array if no products found
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are always ordered by product ID in ascending order
   * - Media URLs are converted to public HTTPS URLs for client access
   * - Logs media field changes during formatting for debugging
   * - Empty array returned for consistency
   * - Pagination uses createPaginator helper for offset/limit calculation
   */
  async findAll(
    page: number,
    perPage: number,
  ): Promise<
    | Products_And_ProductsMedia_With_ProductVariants_And_ProductVariantsMedia[]
    | []
  > {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        Products_And_ProductsMedia_With_ProductVariants_And_ProductVariantsMedia,
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
            media: true,
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

        // generate full http url for media files of each product
        result.data[i].media = formatMediaFieldWithLogging(
          result.data[i].media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'product',
          result.data[i].id,
          this.logger,
        );
      }

      this.logger.log(`Fetched products - Page: ${page}, PerPage: ${perPage}`);
      return result.data;
    } catch (error) {
      this.logger.error(`Error fetching products: ${error}`);
      throw new BadRequestException('Failed to fetch products');
    }
  }

  /**
   * Retrieves a single product by ID with all variants and media information.
   *
   * This method performs the following operations:
   * 1. Queries the database for the product by ID
   * 2. Includes all product variants and their associated media
   * 3. Formats all product variant media URLs to public HTTPS URLs
   * 4. Formats all product media URLs to public HTTPS URLs
   * 5. Logs retrieval operation and any media field changes
   *
   * @param {number} id - The unique identifier of the product to retrieve
   *   - Must reference an existing product in the database
   *   - Used to locate and fetch specific product record
   *
   * @returns {Promise<Products_And_ProductsMedia_With_ProductVariants_And_ProductVariantsMedia | null>} The product with all details including:
   *   - Product information (id, name, price, stock, etc.)
   *   - Product media files with formatted public HTTPS URLs
   *   - All associated product variants with their metadata
   *   - Variant media files with formatted public HTTPS URLs
   *   - Returns null if product not found
   *
   * @throws {NotFoundException} If product is not found by the provided ID
   * @throws {BadRequestException} If data fetching fails
   *
   * @remarks
   * - Media URLs are converted to public HTTPS URLs for client access
   * - Logs media field changes during formatting for debugging
   * - Includes complete product hierarchy with all variants and their media
   * - Uses findFirst query for flexibility (could be replaced with findUnique)
   * - All associated data is eagerly loaded in single query
   */
  async findOne(
    id: number,
  ): Promise<Products_And_ProductsMedia_With_ProductVariants_And_ProductVariantsMedia | null> {
    try {
      const product: Products_And_ProductsMedia_With_ProductVariants_And_ProductVariantsMedia | null =
        await this.prismaService.products.findFirst({
          include: {
            media: true,
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

      // generate full http url for media files for product variants of product
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

      // generate full http url for media files of product
      product.media = formatMediaFieldWithLogging(
        product.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'product',
        product.id,
        this.logger,
      );

      this.logger.log(`Product fetched with ID: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error(`Error fetching product with ID ${id}: ${error}`);
      throw new BadRequestException('Failed to fetch product');
    }
  }

  /**
   * Updates an existing product with new information and manages media files.
   *
   * This method performs the following operations:
   * 1. Retrieves the existing product with current media files
   * 2. Extracts mediaIdsToDelete from DTO (if provided)
   * 3. Updates the product record with provided data
   * 4. Uploads new media files to S3 if files are provided
   * 5. Deletes specified media files from S3 and database
   * 6. Retrieves the updated product with all variants and media
   * 7. Formats all media URLs to public HTTPS URLs for both product and variants
   * 8. Logs the update operation
   *
   * @param {number} id - The unique identifier of the product to update
   *   - Must reference an existing product in the database
   *   - Used to locate and update specific product record
   *
   * @param {UpdateProductDto} updateProductDto - The data transfer object containing product updates:
   *   - Standard fields: name, description, price, stock, category, etc.
   *   - mediaIdsToDelete: Array of media IDs to remove from product (extracted and processed separately)
   *   - Only provided fields are updated, null fields are skipped
   *
   * @param {string} adminId - The ID of the admin performing the update
   *   - Used for tracking which admin uploaded new media files
   *   - Associated with all newly uploaded media records
   *
   * @param {Express.Multer.File[]} files - Array of new media files to upload for the product
   *   - Files are uploaded to S3 with unique naming based on product ID
   *   - Empty array if no new files are being added
   *   - Upload is skipped if files array is empty or null
   *
   * @returns {Promise<Products_And_ProductsMedia_With_ProductVariants_And_ProductVariantsMedia>} The updated product with all details including:
   *   - Updated product information (id, name, price, stock, etc.)
   *   - Product media files with formatted public HTTPS URLs
   *   - All associated product variants with their metadata
   *   - Variant media files with formatted public HTTPS URLs
   *
   * @throws {BadRequestException} If product update fails, file upload fails, or file deletion from S3 fails
   * @throws {NotFoundException} If product is not found
   *
   * @remarks
   * - Media file operations (upload/delete) are performed after product update validation
   * - Deleted media files are removed from both S3 storage and database
   * - New media files are uploaded to S3 and database records created
   * - Media URLs are converted to public HTTPS URLs for client access
   * - Supports selective media deletion using mediaIdsToDelete array
   * - All media file associations are logged during formatting
   * - Product update is committed before media operations begin
   */
  async update(
    files: Express.Multer.File[],
    id: number,
    updateProductDto: UpdateProductDto,
    adminId: string,
  ): Promise<Products_And_ProductsMedia_With_ProductVariants_And_ProductVariantsMedia> {
    try {
      // Find old product with media files and prepare to delete selected media files
      const oldProduct: ProductsWithProductsMedia | null =
        await this.prismaService.products.findUnique({
          include: { media: true },
          where: { id: id },
        });

      const oldMediaFiles: Media[] | undefined = oldProduct?.media;

      // dto have media ids to delete if you want to delete some media files and upload new files
      const { mediaIdsToDelete, ...updateData } = updateProductDto;

      const product = await this.prismaService.products.update({
        where: { id: id },
        data: { ...updateData },
      });

      if (!product) {
        throw new BadRequestException('Failed to update product');
      }

      // update media files if have new uploaded files
      if (files && files.length > 0) {
        const mediaUploadForProduct =
          await this.awsService.uploadManyProductAvatarFile(
            files,
            adminId,
            id.toString(),
          );

        if (!mediaUploadForProduct) {
          throw new BadRequestException('Failed to upload product media files');
        }
      }

      // Delete media files from s3 and database if update product and media files successfully
      if (mediaIdsToDelete && mediaIdsToDelete.length > 0) {
        const mediaFilesToDelete = oldMediaFiles?.filter((media) =>
          mediaIdsToDelete.includes(media.id),
        );

        if (mediaFilesToDelete && mediaFilesToDelete.length > 0) {
          for (const media of mediaFilesToDelete) {
            await this.awsService.deleteFileFromS3(media.url);
          }

          await this.prismaService.media.deleteMany({
            where: { id: { in: mediaIdsToDelete } },
          });
        }
      }

      const returnProduct = await this.prismaService.products.findUnique({
        where: { id: product.id },
        include: {
          media: true,
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

      // generate full http url for media files of each product variant in products
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

      // generate full http url for media files of product
      returnProduct.media = formatMediaFieldWithLogging(
        returnProduct.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'product',
        returnProduct.id,
        this.logger,
      );

      this.logger.log(`Product updated with ID: ${product.id}`);
      return returnProduct;
    } catch (error) {
      this.logger.error(`Error updating product with ID ${id}: ${error}`);
      throw new BadRequestException('Failed to update product');
    }
  }

  /**
   * Deletes a product and all its associated data from the database and storage.
   *
   * This method performs the following operations within a database transaction:
   * 1. Retrieves the product with all variants, reviews, and their media files
   * 2. Deletes all product media files from S3 storage
   * 3. Deletes all product variants from database
   * 4. Deletes all variant media files from S3 storage
   * 5. Deletes all product reviews from database
   * 6. Deletes all review media files from S3 storage
   * 7. Deletes the product record from the database
   * 8. Logs the deletion operation
   *
   * @param {number} id - The unique identifier of the product to delete
   *   - Must reference an existing product in the database
   *   - Used to locate and delete specific product and all related records
   *
   * @returns {Promise<Products>} The deleted product record
   *   - Returns the product object that was removed from the database
   *
   * @throws {NotFoundException} If product is not found by the provided ID
   * @throws {BadRequestException} If deletion fails
   *
   * @remarks
   * - This operation is cascading and will delete all related data (variants, reviews, media)
   * - Media files are removed from S3 storage before database records are deleted
   * - Uses database transaction to ensure data consistency across all deletions
   * - If any operation fails, the entire transaction is rolled back
   * - Verify before deletion as this action cannot be easily reversed
   * - Use with caution in production environments
   * - All media files are permanently removed from AWS S3 storage
   */
  async remove(id: number): Promise<Products> {
    try {
      this.logger.log(`Deleting product with ID: ${id}`);
      return await this.prismaService.$transaction(async (tx) => {
        // find the product with all variants and reviews
        // including their media files
        // to delete media files from s3
        // before delete product, variants, reviews in database
        const product = await tx.products.findUnique({
          where: { id: id },
          include: {
            media: true,
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

        // delete media files of product from aws s3
        for (const media of product.media) {
          await this.awsService.deleteFileFromS3(media.url);
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

        // delete product
        const result = await tx.products.delete({
          where: { id: id },
        });
        this.logger.log(`Product deleted with ID: ${id}`);
        return result;
      });
    } catch (error) {
      this.logger.error(`Error deleting product with ID ${id}: ${error}`);
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
            product: true,
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
      this.logger.error(
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
      this.logger.error(
        `Error fetching reviews for product ID ${id}: ${error}`,
      );
      throw new BadRequestException('Failed to fetch product reviews');
    }
  }
}
