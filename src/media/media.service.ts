import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Media, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new media file metadata record.
   *
   * This method performs the following operations:
   * 1. Creates media metadata record in database
   * 2. Logs successful creation
   * 3. Returns created media file information
   *
   * @param {CreateMediaDto} createMediaDto - The media metadata containing:
   *   - mediaUrl (S3 key or path)
   *   - mediaType (IMAGE, VIDEO, DOCUMENT)
   *   - altText (optional)
   *   - Related entity IDs (productVariantId, reviewId, etc.)
   *
   * @returns {Promise<Media>} The created media record with:
   *   - Media ID, URL, type
   *   - Alt text, dimensions
   *   - Related entity references
   *   - Created timestamp
   *
   * @throws {BadRequestException} If media metadata creation fails
   *
   * @remarks
   * - Stores metadata only, actual files stored in S3
   * - mediaUrl is S3 key, not full URL
   * - Links media to products, reviews, or other entities
   * - Used by AwsS3Service after successful file upload
   */
  async create(createMediaDto: CreateMediaDto): Promise<Media> {
    try {
      const mediaFile = await this.prismaService.media.create({
        data: { ...createMediaDto },
      });

      this.logger.log(`Media file created with ID: ${mediaFile.id}`);
      return mediaFile;
    } catch (error) {
      this.logger.error('Failed to create media file: ', error);
      throw new BadRequestException('Failed to create media file');
    }
  }

  /**
   * Retrieves paginated list of all media file metadata records.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries all media metadata from database
   * 3. Sorts results by media ID ascending
   * 4. Returns paginated media data
   * 5. Logs successful retrieval
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of media records per page
   *
   * @returns {Promise<Media[] | []>} Array of media metadata or empty array:
   *   - Media ID, URL (S3 key), type
   *   - Alt text, dimensions
   *   - Related entity IDs
   *   - Created timestamp
   *
   * @throws {BadRequestException} If media retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by media ID in ascending order
   * - Returns empty array if no media records exist
   * - URLs are S3 keys, need to be converted to full URLs by AwsS3Service
   */
  async findAll(page: number, perPage: number): Promise<Media[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Media, Prisma.MediaFindManyArgs>(
        this.prismaService.media,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Fetched all media files - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all media files: ', error);
      throw new BadRequestException('Failed to fetch all media files');
    }
  }

  /**
   * Retrieves a single media file metadata record by ID.
   *
   * This method performs the following operations:
   * 1. Queries media metadata by ID
   * 2. Validates media record exists
   * 3. Logs successful retrieval
   * 4. Returns media metadata
   *
   * @param {number} id - The media ID to retrieve
   *
   * @returns {Promise<Media | null>} The media metadata with:
   *   - Media ID, URL (S3 key), type
   *   - Alt text, dimensions
   *   - Related entity IDs
   *   - Created/updated timestamps
   *
   * @throws {NotFoundException} If media record not found
   * @throws {BadRequestException} If media retrieval fails
   *
   * @remarks
   * - Returns null if media doesn't exist
   * - Used for media management operations
   * - URL is S3 key, needs conversion to full URL
   */
  async findOne(id: number): Promise<Media | null> {
    try {
      const mediaFile = await this.prismaService.media.findFirst({
        where: { id: id },
      });

      if (!mediaFile) {
        throw new NotFoundException('Media file not found!');
      }

      this.logger.log(`Fetched media file with ID: ${id}`);
      return mediaFile;
    } catch (error) {
      this.logger.error(`Failed to fetch media file with ID ${id}: `, error);
      throw new BadRequestException('Failed to fetch media file');
    }
  }

  /**
   * Updates existing media file metadata record.
   *
   * This method performs the following operations:
   * 1. Updates media metadata in database
   * 2. Logs successful update
   * 3. Returns updated media record
   *
   * @param {number} id - The media ID to update
   * @param {UpdateMediaDto} updateMediaDto - The update data containing:
   *   - mediaUrl (new S3 key if file replaced)
   *   - altText (updated description)
   *   - mediaType (if changed)
   *   - Related entity IDs (if relationships changed)
   *
   * @returns {Promise<Media>} The updated media metadata with all details
   *
   * @throws {BadRequestException} If media update fails
   * @throws {NotFoundException} If media record not found
   *
   * @remarks
   * - Primarily used to update alt text and metadata
   * - If mediaUrl changes, old S3 file should be deleted separately
   * - Does not handle actual file uploads (use AwsS3Service)
   * - Used for metadata corrections and alt text updates
   */
  async update(id: number, updateMediaDto: UpdateMediaDto): Promise<Media> {
    try {
      const mediaFile = await this.prismaService.media.update({
        where: { id: id },
        data: { ...updateMediaDto },
      });

      this.logger.log(`Updated media file with ID: ${id}`);
      return mediaFile;
    } catch (error) {
      this.logger.error(`Failed to update media file with ID ${id}: `, error);
      throw new BadRequestException('Failed to update media file');
    }
  }

  /**
   * Deletes a media file metadata record by ID.
   *
   * This method performs the following operations:
   * 1. Logs deletion operation
   * 2. Deletes media metadata from database
   * 3. Returns deleted media record
   *
   * @param {number} id - The media ID to delete
   *
   * @returns {Promise<Media>} The deleted media metadata with all details
   *
   * @throws {BadRequestException} If media deletion fails
   * @throws {NotFoundException} If media record not found
   *
   * @remarks
   * - This operation is irreversible
   * - Does NOT delete actual S3 file (use AwsS3Service.deleteMediaFile)
   * - Database cascades handle related record cleanup
   * - Should be called AFTER S3 file deletion for proper cleanup
   * - Used when removing media from products, reviews, etc.
   */
  async remove(id: number): Promise<Media> {
    try {
      this.logger.log(`Removing media file with ID: ${id}`);
      return await this.prismaService.media.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error(`Failed to remove media file with ID ${id}: `, error);
      throw new BadRequestException('Failed to remove media file');
    }
  }
}
