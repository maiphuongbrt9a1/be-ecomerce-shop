import {
  Logger,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Media, Prisma, ProductVariants } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import { formatMediaField, formatMediaFieldWithLogging } from '@/helpers/utils';
import {
  ProductVariantsWithMediaInformation,
  ReviewsWithMedia,
} from '@/helpers/types/types';

@Injectable()
export class ProductVariantsService {
  private readonly logger = new Logger(ProductVariantsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  /**
   * Creates a new product variant with media file uploads to S3.
   *
   * This method performs the following operations:
   * 1. Creates a new product variant in the database
   * 2. Uploads associated media files to S3 storage
   * 3. Retrieves the created variant with all media information
   * 4. Formats all media URLs to public HTTPS URLs
   * 5. Logs the creation operation
   *
   * @param {Express.Multer.File[]} files - Array of media files to upload
   * @param {CreateProductVariantDto} createProductVariantDto - The data transfer object containing variant information:
   *   - productId, size, color, sku, price, stock details
   * @param {string} adminId - The ID of the admin creating the variant
   *
   * @returns {Promise<ProductVariants>} The created variant with all details including:
   *   - Variant information (id, sku, size, color, price, stock)
   *   - Media files with formatted public HTTPS URLs
   *
   * @throws {NotFoundException} If variant creation, media upload, or retrieval fails
   *
   * @remarks
   * - Media files are uploaded to S3 before database confirmation
   * - Media URLs are converted to public HTTPS URLs
   * - Validates successful creation before returning data
   */
  async create(
    files: Express.Multer.File[],
    createProductVariantDto: CreateProductVariantDto,
    adminId: string,
  ): Promise<ProductVariants> {
    // create product variant first
    try {
      const productVariant = await this.prismaService.productVariants.create({
        data: { ...createProductVariantDto },
      });

      if (!productVariant) {
        this.logger.log('Failed to create product variant');
        throw new NotFoundException('Failed to create product variant');
      }

      // upload media files for product variant if have supplied files and create new product variant successfully
      const mediaForProductVariant =
        await this.awsService.uploadManyProductFile(
          files,
          adminId,
          productVariant.id.toString(),
        );

      if (!mediaForProductVariant) {
        this.logger.log('Failed to upload product media file');
        throw new NotFoundException('Failed to upload product media file');
      }

      // return new product variant
      const newProductVariant =
        await this.prismaService.productVariants.findUnique({
          include: { media: true },
          where: { id: productVariant.id },
        });

      if (!newProductVariant) {
        this.logger.log('Failed to retrieve new product variant');
        throw new NotFoundException('Failed to retrieve new product variant');
      }

      // generate full http url for media files
      newProductVariant.media = formatMediaField(
        newProductVariant.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
      );

      this.logger.log(
        'Product variant created successfully with id: ' + productVariant.id,
      );

      return newProductVariant;
    } catch (error) {
      this.logger.log('Error creating product variant: ' + error);
      throw new NotFoundException('Failed to create product variant');
    }
  }

  /**
   * Retrieves a paginated list of all product variants with media.
   *
   * This method performs the following operations:
   * 1. Fetches product variants from the database with pagination
   * 2. Includes all media files for each variant
   * 3. Formats all media URLs to public HTTPS URLs
   * 4. Logs retrieval operation and media changes
   *
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of variants to retrieve per page
   *
   * @returns {Promise<ProductVariantsWithMediaInformation[] | []>} Array of variants with details including:
   *   - Variant information (id, sku, size, color, price, stock)
   *   - Media files with formatted public HTTPS URLs
   *   Returns empty array if no variants found
   *
   * @throws {NotFoundException} If data fetching fails
   *
   * @remarks
   * - Results are ordered by variant ID in ascending order
   * - Media URLs are converted to public HTTPS URLs
   * - Logs media field changes during formatting
   */
  async findAll(
    page: number,
    perPage: number,
  ): Promise<ProductVariantsWithMediaInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const productVariantList = await paginate<
        ProductVariantsWithMediaInformation,
        Prisma.ProductVariantsFindManyArgs
      >(
        this.prismaService.productVariants,
        {
          include: {
            media: true,
          },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full http url for media files
      for (let i = 0; i < productVariantList.data.length; i++) {
        const productVariant = productVariantList.data[i];
        productVariant.media = formatMediaFieldWithLogging(
          productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'product variant',
          productVariant.id,
          this.logger,
        );
      }

      this.logger.log(
        `Retrieved ${productVariantList.data.length} product variants successfully`,
      );
      return productVariantList.data;
    } catch (error) {
      this.logger.log('Error retrieving product variants: ' + error);
      throw new NotFoundException('Failed to retrieve product variants');
    }
  }

  /**
   * Retrieves a single product variant by ID with all media.
   *
   * This method performs the following operations:
   * 1. Queries the database for the variant by ID
   * 2. Includes all associated media files
   * 3. Formats all media URLs to public HTTPS URLs
   * 4. Logs retrieval and media changes
   *
   * @param {number} id - The unique identifier of the variant to retrieve
   *
   * @returns {Promise<ProductVariantsWithMediaInformation | null>} The variant with all details including:
   *   - Variant information (id, sku, size, color, price, stock)
   *   - Media files with formatted public HTTPS URLs
   *   Returns null if variant not found
   *
   * @throws {NotFoundException} If variant is not found
   *
   * @remarks
   * - Media URLs are converted to public HTTPS URLs
   * - Logs media field changes during formatting
   */
  async findOne(
    id: number,
  ): Promise<ProductVariantsWithMediaInformation | null> {
    try {
      const productVariant = await this.prismaService.productVariants.findFirst(
        {
          include: {
            media: true,
          },
          where: { id: id },
        },
      );

      if (!productVariant) {
        throw new NotFoundException('Product Variant not found!');
      }

      // generate full http url for media files
      const originalMedia = productVariant.media; // Store original media for comparison
      productVariant.media = formatMediaField(
        productVariant.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
      );

      if (originalMedia !== productVariant.media) {
        this.logger.log(
          `Media field changed for product variant ID: ${productVariant.id}`,
        );
      }

      this.logger.log('Retrieved product variant successfully with id: ' + id);
      return productVariant;
    } catch (error) {
      this.logger.log('Error retrieving product variant: ' + error);
      throw new NotFoundException('Failed to retrieve product variant');
    }
  }

  /**
   * Updates an existing product variant with new data and media file management.
   *
   * This method performs the following operations:
   * 1. Retrieves the current variant with all media information
   * 2. Updates variant data in the database
   * 3. Uploads new media files to S3 if provided
   * 4. Deletes selected media files from S3 and database based on mediaIdsToDelete
   * 5. Retrieves the updated variant with all media
   * 6. Formats all media URLs to public HTTPS URLs
   * 7. Logs the update operation
   *
   * @param {Express.Multer.File[]} files - Array of new media files to upload
   * @param {number} id - The unique identifier of the variant to update
   * @param {UpdateProductVariantDto} updateProductVariantDto - The data transfer object containing updates:
   *   - May include size, color, price, stock, or mediaIdsToDelete for removing specific media
   * @param {string} adminId - The ID of the admin performing the update
   *
   * @returns {Promise<ProductVariantsWithMediaInformation>} The updated variant with all details including:
   *   - Updated variant information
   *   - Updated media files with formatted public HTTPS URLs
   *
   * @throws {NotFoundException} If variant update or retrieval fails
   * @throws {BadRequestException} If media upload fails
   *
   * @remarks
   * - Handles both adding new media and removing existing media in one operation
   * - Media files are uploaded to S3 and deleted from S3 as specified
   * - Validates successful update before returning data
   * - Media URLs are converted to public HTTPS URLs
   */
  async update(
    files: Express.Multer.File[],
    id: number,
    updateProductVariantDto: UpdateProductVariantDto,
    adminId: string,
  ): Promise<ProductVariantsWithMediaInformation> {
    try {
      // Find old product variant with media files and prepare to delete selected media files
      const oldProductVariant =
        await this.prismaService.productVariants.findUnique({
          include: { media: true },
          where: { id: id },
        });
      const oldMediaFiles = oldProductVariant?.media;

      // dto have media ids to delete if you want to delete some media files and upload new files
      const { mediaIdsToDelete, ...updateData } = updateProductVariantDto;

      // update product variant data
      const newProductVariant = await this.prismaService.productVariants.update(
        {
          include: { media: true },
          where: { id: id },
          data: updateData,
        },
      );

      if (!newProductVariant) {
        throw new NotFoundException('Failed to update product variant');
      }

      // update media files if have new uploaded files
      if (files && files.length > 0) {
        const mediaUploadForProductVariant =
          await this.awsService.uploadManyProductFile(
            files,
            adminId,
            id.toString(),
          );

        if (!mediaUploadForProductVariant) {
          throw new NotFoundException('Failed to upload product media files');
        }
      }

      // Delete media files from s3 and database if update product variant and media files successfully
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

      // generate full http url for media files
      const resultProductVariant =
        await this.prismaService.productVariants.findUnique({
          include: { media: true },
          where: { id: newProductVariant.id },
        });

      if (!resultProductVariant) {
        throw new NotFoundException(
          'Failed to retrieve updated product variant',
        );
      }

      const originalMedia = resultProductVariant.media; // Store original media for comparison
      resultProductVariant.media = formatMediaField(
        resultProductVariant.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
      );

      if (originalMedia !== resultProductVariant.media) {
        this.logger.log(
          `Media field changed for product variant ID: ${resultProductVariant.id}`,
        );
      }

      // return updated product variant
      this.logger.log(
        'Product variant updated successfully with id: ' +
          resultProductVariant.id,
      );

      return resultProductVariant;
    } catch (error) {
      this.logger.log('Error updating product variant: ' + error);
      throw new NotFoundException('Failed to update product variant');
    }
  }

  /**
   * Deletes a product variant and all its associated media files.
   *
   * This method performs the following operations:
   * 1. Retrieves all media files associated with the variant
   * 2. Deletes the variant from the database
   * 3. Deletes all associated media files from S3 storage
   * 4. Logs the deletion operation
   *
   * @param {number} id - The unique identifier of the variant to delete
   *
   * @returns {Promise<ProductVariants>} The deleted variant record
   *
   * @throws {BadRequestException} If variant deletion or media deletion fails
   *
   * @remarks
   * - This operation is cascading and will delete all related media
   * - Media files are removed from S3 storage along with database records
   * - Verify before deletion as this action cannot be easily reversed
   * - Use with caution in production environments
   */
  async remove(id: number): Promise<ProductVariants> {
    try {
      // delete media files from s3 first
      const mediaFilesToDelete = await this.prismaService.media.findMany({
        where: { productVariantId: id },
        select: { url: true, id: true },
      });

      // delete product variant and its media files, reviews from postgresql db
      const productVariant = await this.prismaService.productVariants.delete({
        where: { id: id },
      });

      try {
        for (const media of mediaFilesToDelete) {
          await this.awsService.deleteFileFromS3(media.url);
        }
      } catch (error) {
        this.logger.log('Error deleting media files from S3: ' + error);
        throw new BadRequestException('Failed to delete media files from S3');
      }

      this.logger.log('Product variant deleted successfully with id: ' + id);
      return productVariant;
    } catch (error) {
      this.logger.log('Error deleting product variant: ' + error);
      throw new BadRequestException('Failed to delete product variant');
    }
  }

  /**
   * Retrieves paginated reviews for a specific product variant with media.
   *
   * This method performs the following operations:
   * 1. Fetches paginated reviews for the variant from the database
   * 2. Includes all media files associated with each review
   * 3. Formats all media URLs to public HTTPS URLs
   * 4. Logs retrieval operation
   *
   * @param {number} id - The unique identifier of the product variant
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
   * - Useful for variant detail pages showing customer reviews
   */
  async getReviewsOfProductVariant(
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
          include: {
            media: true,
          },
          where: { productVariantId: id },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full https link for media files
      for (let i = 0; i < result.data.length; i++) {
        const review = result.data[i];
        review.media = formatMediaFieldWithLogging(
          review.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'review',
          review.id,
          this.logger,
        );
      }

      this.logger.log(
        `Retrieved ${result.data.length} reviews for product variant id: ${id} successfully`,
      );
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving reviews: ' + error);
      throw new BadRequestException('Failed to retrieve reviews');
    }
  }

  /**
   * Retrieves paginated media files for a specific product variant.
   *
   * This method performs the following operations:
   * 1. Fetches paginated media files for the variant from the database
   * 2. Formats all media URLs to public HTTPS URLs
   * 3. Logs retrieval and media URL changes
   *
   * @param {number} id - The unique identifier of the product variant
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of media files to retrieve per page
   *
   * @returns {Promise<Media[] | []>} Array of media records with details including:
   *   - Media information (id, url, type, size)
   *   - Formatted public HTTPS URLs
   *   Returns empty array if no media found
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by media ID in ascending order
   * - Media URLs are converted to public HTTPS URLs
   * - Useful for media gallery displays and management
   */
  async getAllMediaOfProductVariant(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Media[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Media, Prisma.MediaFindManyArgs>(
        this.prismaService.media,
        { where: { productVariantId: id }, orderBy: { id: 'asc' } },
        { page: page },
      );

      // generate full https link for media files
      for (let i = 0; i < result.data.length; i++) {
        const media = result.data[i];
        const originalUrl = media.url;
        media.url = this.awsService.buildPublicMediaUrl(media.url);

        if (originalUrl !== media.url) {
          this.logger.log(
            `Media URL changed for media ID: ${media.id} of product variant ID: ${id}`,
          );
        }
      }

      this.logger.log(
        `Retrieved ${result.data.length} media files for product variant id: ${id} successfully`,
      );
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving media files: ' + error);
      throw new BadRequestException('Failed to retrieve media files');
    }
  }
}
