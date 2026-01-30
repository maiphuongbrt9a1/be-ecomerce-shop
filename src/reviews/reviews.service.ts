import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Media, Prisma, Reviews } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import { ReviewsWithMedia } from '@/helpers/types/types';
import { formatMediaFieldWithLogging } from '@/helpers/utils';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  /**
   * Creates a new product review with media files (images/videos).
   *
   * This method performs the following operations:
   * 1. Creates review record in database
   * 2. Uploads review media files to S3
   * 3. Retrieves created review with media
   * 4. Formats media URLs to public HTTPS URLs
   * 5. Logs successful creation
   * 6. Returns review with formatted media
   *
   * @param {Express.Multer.File[]} files - Array of media files (images/videos) to upload
   * @param {CreateReviewDto} createReviewDto - The review data containing:
   *   - userId, productId, productVariantId
   *   - rating (1-5), comment, title
   *   - verifiedPurchase status
   * @param {string} userId - The user ID creating the review
   *
   * @returns {Promise<ReviewsWithMedia>} The created review with details:
   *   - Review ID, user ID, product/variant IDs
   *   - Rating, comment, title
   *   - Media files with formatted HTTPS URLs
   *   - Created timestamp
   *
   * @throws {NotFoundException} If review creation, media upload, or retrieval fails
   * @throws {BadRequestException} If overall operation fails
   *
   * @remarks
   * - Review media files are uploaded to S3 storage
   * - All media URLs are formatted to public HTTPS format
   * - Used for customer product feedback with visual evidence
   * - Supports multiple media files per review
   */
  async create(
    files: Express.Multer.File[],
    createReviewDto: CreateReviewDto,
    userId: string,
  ): Promise<ReviewsWithMedia> {
    try {
      const result = await this.prismaService.reviews.create({
        data: { ...createReviewDto },
      });

      if (!result) {
        throw new NotFoundException('Failed to create review');
      }

      const mediaForReview = await this.awsService.uploadManyReviewFile(
        files,
        userId,
        result.id.toString(),
        result.productVariantId.toString(),
      );

      if (!mediaForReview) {
        throw new NotFoundException('Failed to upload review media file');
      }

      const returnResult = await this.prismaService.reviews.findUnique({
        include: { media: true },
        where: { id: result.id },
      });

      if (!returnResult) {
        throw new NotFoundException('Failed to fetch created review');
      }

      // generate full http url for media files
      returnResult.media = formatMediaFieldWithLogging(
        returnResult.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'review',
        returnResult.id,
        this.logger,
      );

      this.logger.log('Review created successfully', returnResult.id);
      return returnResult;
    } catch (error) {
      this.logger.log('Error creating review', error);
      throw new BadRequestException('Failed to create review');
    }
  }

  /**
   * Retrieves paginated list of all reviews with media.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries all reviews from database
   * 3. Includes review media files
   * 4. Sorts results by review ID ascending
   * 5. Formats all media URLs to public HTTPS URLs
   * 6. Logs successful retrieval
   * 7. Returns paginated review data
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of reviews per page
   *
   * @returns {Promise<ReviewsWithMedia[] | []>} Array of reviews or empty array:
   *   - Review ID, user ID, product/variant IDs
   *   - Rating, comment, title
   *   - Media with formatted HTTPS URLs
   *   - Helpful count, verified purchase status
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If review retrieval or media formatting fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by review ID in ascending order
   * - All review media URLs are formatted to public HTTPS
   * - Used for product review displays and admin management
   */
  async findAll(
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
        { include: { media: true }, orderBy: { id: 'asc' } },
        { page: page },
      );

      // generate full http url for media files
      for (let i = 0; i < result.data.length; i++) {
        result.data[i].media = formatMediaFieldWithLogging(
          result.data[i].media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'review',
          result.data[i].id,
          this.logger,
        );
      }

      this.logger.log('Fetched reviews successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error fetching reviews', error);
      throw new BadRequestException('Failed to fetch reviews');
    }
  }

  /**
   * Retrieves a single review by ID with media.
   *
   * This method performs the following operations:
   * 1. Queries review by ID
   * 2. Includes review media files
   * 3. Validates review exists
   * 4. Formats media URLs to public HTTPS URLs
   * 5. Logs successful retrieval
   * 6. Returns review with formatted media
   *
   * @param {number} id - The review ID to retrieve
   *
   * @returns {Promise<ReviewsWithMedia | null>} The review with details:
   *   - Review ID, user ID, product/variant IDs
   *   - Rating, comment, title
   *   - Media with formatted HTTPS URLs
   *   - Helpful count, verified purchase status
   *   - Created/updated timestamps
   *
   * @throws {NotFoundException} If review not found
   * @throws {BadRequestException} If review retrieval or media formatting fails
   *
   * @remarks
   * - Returns null if review doesn't exist
   * - All review media URLs are formatted to public HTTPS
   * - Used for displaying individual review details
   * - Includes all media files associated with review
   */
  async findOne(id: number): Promise<ReviewsWithMedia | null> {
    try {
      const result = await this.prismaService.reviews.findFirst({
        include: { media: true },
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Review not found!');
      }

      // generate full http url for media files
      result.media = formatMediaFieldWithLogging(
        result.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'review',
        result.id,
        this.logger,
      );

      this.logger.log('Fetched review successfully', id);

      return result;
    } catch (error) {
      this.logger.log('Error fetching review', error);
      throw new BadRequestException('Failed to fetch review');
    }
  }

  /**
   * Updates an existing review with optional media file management.
   *
   * This method performs the following operations:
   * 1. Retrieves existing review with media
   * 2. Updates review data in database
   * 3. Uploads new media files to S3 if provided
   * 4. Deletes specified old media files from S3 and database
   * 5. Retrieves updated review with all media
   * 6. Formats media URLs to public HTTPS URLs
   * 7. Logs successful update
   * 8. Returns updated review
   *
   * @param {number} id - The review ID to update
   * @param {UpdateReviewDto} updateReviewDto - The update data containing:
   *   - rating, comment, title (optional)
   *   - mediaIdsToDelete (array of media IDs to remove)
   * @param {Express.Multer.File[]} files - Optional new media files to upload
   * @param {string} adminId - The admin/user ID performing the update
   *
   * @returns {Promise<ReviewsWithMedia>} The updated review with details:
   *   - Review ID, user ID, product/variant IDs
   *   - Updated rating, comment, title
   *   - Updated media with formatted HTTPS URLs
   *   - Updated timestamp
   *
   * @throws {NotFoundException} If review not found or media operations fail
   * @throws {BadRequestException} If update operation fails
   *
   * @remarks
   * - Can update review text and manage media files simultaneously
   * - Old media files are deleted from S3 when removed
   * - New media files are uploaded to S3
   * - All media URLs are formatted to public HTTPS
   * - Used for review editing and moderation
   */
  async update(
    id: number,
    updateReviewDto: UpdateReviewDto,
    files: Express.Multer.File[],
    adminId: string,
  ): Promise<ReviewsWithMedia> {
    try {
      // Find old review with media files and prepare to delete selected media files
      const oldReview = await this.prismaService.reviews.findUnique({
        include: { media: true },
        where: { id: id },
      });
      const oldMediaFiles = oldReview?.media;

      // dto have media ids to delete if you want to delete some media files and upload new files
      const { mediaIdsToDelete, ...updateData } = updateReviewDto;

      // update review data
      const newReview = await this.prismaService.reviews.update({
        include: { media: true },
        where: { id: id },
        data: updateData,
      });

      if (!newReview) {
        throw new NotFoundException('Failed to update review');
      }

      // update media files if have new uploaded files
      if (files && files.length > 0) {
        const mediaUploadForReview = await this.awsService.uploadManyReviewFile(
          files,
          adminId,
          id.toString(),
          newReview.productVariantId.toString(),
        );

        if (!mediaUploadForReview) {
          throw new NotFoundException('Failed to upload review media files');
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
      const resultReview = await this.prismaService.reviews.findUnique({
        include: { media: true },
        where: { id: newReview.id },
      });

      if (!resultReview) {
        throw new NotFoundException('Failed to retrieve updated review');
      }

      resultReview.media = formatMediaFieldWithLogging(
        resultReview.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'review',
        resultReview.id,
        this.logger,
      );
      // return updated review
      this.logger.log(
        'Review updated successfully with id: ' + resultReview.id,
      );

      return resultReview;
    } catch (error) {
      this.logger.log('Error updating review', error);
      throw new BadRequestException('Failed to update review');
    }
  }

  /**
   * Deletes a review and all associated media files.
   *
   * This method performs the following operations:
   * 1. Retrieves review with media files
   * 2. Validates review exists
   * 3. Deletes review record from database
   * 4. Deletes all associated media files from S3
   * 5. Logs successful deletion
   * 6. Returns deleted review
   *
   * @param {number} id - The review ID to delete
   *
   * @returns {Promise<Reviews>} The deleted review with all details
   *
   * @throws {NotFoundException} If review not found
   * @throws {BadRequestException} If deletion operation fails
   *
   * @remarks
   * - This operation is irreversible
   * - All review media files are deleted from S3 storage
   * - Database cascades handle related record cleanup
   * - Used for content moderation and user deletions
   */
  async remove(id: number): Promise<Reviews> {
    try {
      this.logger.log('Deleting review', id);

      // get review to delete associated media files from s3
      const reviewToDelete = await this.prismaService.reviews.findUnique({
        include: { media: true },
        where: { id: id },
      });

      if (!reviewToDelete) {
        throw new NotFoundException('Review not found!');
      }

      // delete review record from database
      const result = await this.prismaService.reviews.delete({
        where: { id: id },
      });

      if (reviewToDelete && reviewToDelete.media.length > 0) {
        // delete associated media files from s3
        for (const media of reviewToDelete.media) {
          await this.awsService.deleteFileFromS3(media.url);
        }
      }

      this.logger.log('Review deleted successfully', id);

      return result;
    } catch (error) {
      this.logger.log('Error deleting review', error);
      throw new BadRequestException('Failed to delete review');
    }
  }

  /**
   * Retrieves paginated list of all media files for a specific review.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries media files for review ID
   * 3. Sorts results by media ID ascending
   * 4. Returns paginated media data
   * 5. Logs successful retrieval
   *
   * @param {number} id - The review ID to retrieve media for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of media files per page
   *
   * @returns {Promise<Media[] | []>} Array of media files or empty array:
   *   - Media ID, review ID
   *   - File URL, type (image/video)
   *   - File size, dimensions
   *   - Created timestamp
   *
   * @throws {BadRequestException} If media retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by media ID in ascending order
   * - Returns empty array if review has no media
   * - Used for gallery displays and media management
   */
  async getAllMediaOfReview(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Media[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Media, Prisma.MediaFindManyArgs>(
        this.prismaService.media,
        { where: { reviewId: id }, orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Fetched media of review successfully', id);
      return result.data;
    } catch (error) {
      this.logger.log('Error fetching media of review', error);
      throw new BadRequestException('Failed to fetch media of review');
    }
  }
}
