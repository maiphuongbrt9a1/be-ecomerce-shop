import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Requests } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import { RequestsWithMedia } from '@/helpers/types/types';
import { formatMediaFieldWithLogging } from '@/helpers/utils';

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  /**
   * Creates a new customer request with media files (returns, exchanges, complaints).
   *
   * This method performs the following operations:
   * 1. Creates request record in database
   * 2. Uploads request media files to S3
   * 3. Retrieves created request with media and staff details
   * 4. Formats media URLs to public HTTPS URLs (request media and staff avatars)
   * 5. Logs successful creation
   * 6. Returns request with formatted media
   *
   * @param {Express.Multer.File[]} files - Array of media files (images/videos) to upload
   * @param {CreateRequestDto} createRequestDto - The request data containing:
   *   - userId, orderId, orderItemId
   *   - requestType (RETURN, EXCHANGE, COMPLAINT, CANCEL)
   *   - status, description, reason
   * @param {string} userId - The user ID creating the request
   *
   * @returns {Promise<RequestsWithMedia>} The created request with details:
   *   - Request ID, user ID, order/item IDs
   *   - Request type, status, description
   *   - Media files with formatted HTTPS URLs
   *   - Staff processor info (if assigned) with avatar URLs
   *   - Created timestamp
   *
   * @throws {NotFoundException} If request creation, media upload, or retrieval fails
   * @throws {BadRequestException} If overall operation fails
   *
   * @remarks
   * - Request media files are uploaded to S3 storage
   * - All media URLs (request and staff avatars) are formatted to HTTPS
   * - Used for customer service requests with visual evidence
   * - Supports multiple media files per request
   */
  async create(
    files: Express.Multer.File[],
    createRequestDto: CreateRequestDto,
    userId: string,
  ): Promise<RequestsWithMedia> {
    try {
      const result = await this.prismaService.requests.create({
        data: { ...createRequestDto },
      });

      if (!result) {
        throw new NotFoundException('Failed to create request');
      }

      const mediaForRequest = await this.awsService.uploadManyRequestFile(
        files,
        userId,
        result.id.toString(),
      );

      if (!mediaForRequest) {
        throw new NotFoundException('Failed to upload request media file');
      }

      const returnResult = await this.prismaService.requests.findUnique({
        include: {
          media: true,
          processByStaff: {
            include: {
              userMedia: true,
            },
          },
        },
        where: { id: result.id },
      });

      if (!returnResult) {
        throw new NotFoundException('Failed to fetch created request');
      }

      // generate https link for media field
      if (returnResult.media && returnResult.media.length > 0) {
        returnResult.media = formatMediaFieldWithLogging(
          returnResult.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'request',
          returnResult.id,
          this.logger,
        );
      }

      if (
        returnResult.processByStaff &&
        returnResult.processByStaff.userMedia &&
        returnResult.processByStaff.userMedia.length > 0
      ) {
        returnResult.processByStaff.userMedia = formatMediaFieldWithLogging(
          returnResult.processByStaff.userMedia,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'user',
          returnResult.processByStaff.id,
          this.logger,
        );
      }

      this.logger.log('Request created successfully', returnResult.id);
      return returnResult;
    } catch (error) {
      this.logger.log('Error creating request', error);
      throw new BadRequestException('Error creating request');
    }
  }

  /**
   * Retrieves paginated list of all requests with media and staff details.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries all requests from database
   * 3. Includes request media and staff processor info
   * 4. Sorts results by request ID ascending
   * 5. Formats all media URLs to public HTTPS URLs (requests and staff avatars)
   * 6. Logs successful retrieval
   * 7. Returns paginated request data
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of requests per page
   *
   * @returns {Promise<RequestsWithMedia[] | []>} Array of requests or empty array:
   *   - Request ID, user ID, order/item IDs
   *   - Request type, status, description
   *   - Media with formatted HTTPS URLs
   *   - Staff processor info with avatar URLs
   *   - Created/updated/resolved timestamps
   *
   * @throws {BadRequestException} If request retrieval or media formatting fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by request ID in ascending order
   * - All media URLs (requests and staff avatars) are formatted to HTTPS
   * - Used for customer service request management
   */
  async findAll(
    page: number,
    perPage: number,
  ): Promise<RequestsWithMedia[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        RequestsWithMedia,
        Prisma.RequestsFindManyArgs
      >(
        this.prismaService.requests,
        {
          include: {
            media: true,
            processByStaff: {
              include: {
                userMedia: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate https link for media field
      for (let i = 0; i < result.data.length; i++) {
        const request = result.data[i];

        if (request.media && request.media.length > 0) {
          request.media = formatMediaFieldWithLogging(
            request.media,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'request',
            request.id,
            this.logger,
          );
        }

        if (
          request.processByStaff &&
          request.processByStaff.userMedia &&
          request.processByStaff.userMedia.length > 0
        ) {
          request.processByStaff.userMedia = formatMediaFieldWithLogging(
            request.processByStaff.userMedia,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'user',
            request.processByStaff.id,
            this.logger,
          );
        }
      }

      this.logger.log(
        `Fetched ${perPage} requests on page ${page} successfully`,
      );
      return result.data;
    } catch (error) {
      this.logger.log('Error fetching all requests', error);
      throw new BadRequestException('Error fetching all requests');
    }
  }

  /**
   * Retrieves a single request by ID with media and staff details.
   *
   * This method performs the following operations:
   * 1. Queries request by ID
   * 2. Includes request media and staff processor info
   * 3. Validates request exists
   * 4. Formats media URLs to public HTTPS URLs (request and staff avatars)
   * 5. Logs successful retrieval
   * 6. Returns request with formatted media
   *
   * @param {number} id - The request ID to retrieve
   *
   * @returns {Promise<RequestsWithMedia | null>} The request with details:
   *   - Request ID, user ID, order/item IDs
   *   - Request type, status, description, reason
   *   - Media with formatted HTTPS URLs
   *   - Staff processor info with avatar URLs (if assigned)
   *   - Created/updated/resolved timestamps
   *
   * @throws {NotFoundException} If request not found
   * @throws {BadRequestException} If request retrieval or media formatting fails
   *
   * @remarks
   * - Returns null if request doesn't exist
   * - All media URLs (request and staff avatars) are formatted to HTTPS
   * - Used for displaying individual request details
   * - Includes all media files and staff information
   */
  async findOne(id: number): Promise<RequestsWithMedia | null> {
    try {
      const result = await this.prismaService.requests.findFirst({
        where: { id: id },
        include: {
          media: true,
          processByStaff: {
            include: {
              userMedia: true,
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundException('Request not found!');
      }

      // generate https link for media field
      if (result.media && result.media.length > 0) {
        result.media = formatMediaFieldWithLogging(
          result.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'request',
          result.id,
          this.logger,
        );
      }

      if (
        result.processByStaff &&
        result.processByStaff.userMedia &&
        result.processByStaff.userMedia.length > 0
      ) {
        result.processByStaff.userMedia = formatMediaFieldWithLogging(
          result.processByStaff.userMedia,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'user',
          result.processByStaff.id,
          this.logger,
        );
      }

      this.logger.log('Fetched request successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error fetching request', error);
      throw new BadRequestException('Error fetching request');
    }
  }

  /**
   * Updates an existing request with optional media file management.
   *
   * This method performs the following operations:
   * 1. Retrieves existing request with media
   * 2. Updates request data in database
   * 3. Uploads new media files to S3 if provided
   * 4. Deletes specified old media files from S3 and database
   * 5. Retrieves updated request with all media and staff info
   * 6. Formats media URLs to public HTTPS URLs
   * 7. Logs successful update
   * 8. Returns updated request
   *
   * @param {number} id - The request ID to update
   * @param {UpdateRequestDto} updateRequestDto - The update data containing:
   *   - status, description, reason (optional)
   *   - processByStaffId (optional)
   *   - mediaIdsToDelete (array of media IDs to remove)
   * @param {Express.Multer.File[]} files - Optional new media files to upload
   * @param {string} userId - The user/staff ID performing the update
   *
   * @returns {Promise<RequestsWithMedia>} The updated request with details:
   *   - Request ID, user ID, order/item IDs
   *   - Updated status, description, reason
   *   - Updated media with formatted HTTPS URLs
   *   - Staff processor info with avatar URLs
   *   - Updated timestamp
   *
   * @throws {NotFoundException} If request not found or media operations fail
   * @throws {BadRequestException} If update operation fails
   *
   * @remarks
   * - Can update request status and manage media files simultaneously
   * - Old media files are deleted from S3 when removed
   * - New media files are uploaded to S3
   * - All media URLs are formatted to public HTTPS
   * - Used for request status updates and adding evidence
   */
  async update(
    id: number,
    updateRequestDto: UpdateRequestDto,
    files: Express.Multer.File[],
    userId: string,
  ): Promise<RequestsWithMedia> {
    try {
      // Find old review with media files and prepare to delete selected media files
      const oldRequest = await this.prismaService.requests.findUnique({
        include: { media: true },
        where: { id: id },
      });
      const oldMediaFiles = oldRequest?.media;
      // dto have media ids to delete if you want to delete some media files and upload new files
      const { mediaIdsToDelete, ...updateData } = updateRequestDto;

      const result = await this.prismaService.requests.update({
        where: { id: id },
        data: { ...updateData },
      });

      if (!result) {
        throw new NotFoundException('Failed to update request');
      }

      // update media files if have new uploaded files
      if (files && files.length > 0) {
        const mediaUploadForRequest =
          await this.awsService.uploadManyRequestFile(
            files,
            userId,
            id.toString(),
          );

        if (!mediaUploadForRequest) {
          throw new NotFoundException('Failed to upload request media files');
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
      const resultRequest = await this.prismaService.requests.findUnique({
        include: {
          media: true,
          processByStaff: {
            include: {
              userMedia: true,
            },
          },
        },
        where: { id: result.id },
      });

      if (!resultRequest) {
        throw new NotFoundException('Failed to retrieve updated request');
      }

      resultRequest.media = formatMediaFieldWithLogging(
        resultRequest.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'request',
        resultRequest.id,
        this.logger,
      );

      this.logger.log('Request updated successfully', id);
      return resultRequest;
    } catch (error) {
      this.logger.log('Error updating request', error);
      throw new BadRequestException('Error updating request');
    }
  }

  /**
   * Deletes a request and all associated media files.
   *
   * This method performs the following operations:
   * 1. Retrieves request with media files
   * 2. Deletes request record from database
   * 3. Deletes all associated media files from S3
   * 4. Logs successful deletion
   * 5. Returns deleted request
   *
   * @param {number} id - The request ID to delete
   *
   * @returns {Promise<Requests>} The deleted request with all details
   *
   * @throws {BadRequestException} If deletion operation fails
   * @throws {NotFoundException} If request not found
   *
   * @remarks
   * - This operation is irreversible
   * - All request media files are deleted from S3 storage
   * - Database cascades handle related record cleanup
   * - Used for request cleanup and data retention management
   */
  async remove(id: number): Promise<Requests> {
    try {
      this.logger.log('Deleting request', id);
      // get request to delete associated media files from s3
      const requestToDelete = await this.prismaService.requests.findUnique({
        include: { media: true },
        where: { id: id },
      });

      // delete request record from database
      const result = await this.prismaService.requests.delete({
        where: { id: id },
      });

      // delete associated media files from s3
      if (requestToDelete && requestToDelete.media.length > 0) {
        for (const media of requestToDelete.media) {
          await this.awsService.deleteFileFromS3(media.url);
        }
      }

      this.logger.log('Request deleted successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error deleting request', error);
      throw new BadRequestException('Error deleting request');
    }
  }
}
