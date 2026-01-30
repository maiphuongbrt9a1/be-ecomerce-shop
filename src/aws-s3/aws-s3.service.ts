import * as AWS from 'aws-sdk';
import {
  Logger,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Media, MediaType } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { PromiseResult } from 'aws-sdk/lib/request';

@Injectable()
export class AwsS3Service {
  private readonly logger = new Logger(AwsS3Service.name);
  constructor(private readonly prismaService: PrismaService) {}

  AWS_S3_BUCKET = process.env.BUCKET_S3_NAME!;

  s3 = new AWS.S3({
    region: process.env.AWS_REGION!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  });

  /**
   * Builds a public HTTPS URL for an S3 media file.
   *
   * This method performs the following operations:
   * 1. Constructs public S3 URL from bucket name, region, and key
   *
   * @param {string} key - The S3 object key (path within bucket)
   *
   * @returns {string} Full HTTPS URL to access the file:
   *   - Format: https://bucket-name.s3.region.amazonaws.com/key
   *
   * @remarks
   * - Used to convert S3 keys to displayable URLs
   * - Assumes bucket has public read permissions
   * - Used throughout the application for media display
   * - Does not generate signed/temporary URLs
   */
  buildPublicMediaUrl(key: string): string {
    return `https://${process.env.BUCKET_S3_NAME!}.s3.${process.env.AWS_REGION!}.amazonaws.com/${key}`;
  }

  /**
   * Saves media file metadata to database after successful S3 upload.
   *
   * This method performs the following operations:
   * 1. Logs save operation
   * 2. Creates media record in database within transaction
   * 3. Validates successful creation
   * 4. Returns created media record
   *
   * @param {string} mediaUrl - The S3 key (path) of uploaded file
   * @param {MediaType} mediaType - Type of media (IMAGE, VIDEO, DOCUMENT)
   * @param {number | null} reviewId - Review ID if media attached to review
   * @param {number | null} userId - User ID who uploaded the file
   * @param {number | null} productVariantId - Product variant ID if product media
   * @param {boolean} isShopLogo - True if file is shop logo (default: false)
   * @param {boolean} isShopBanner - True if file is shop banner (default: false)
   * @param {boolean} isCategoryFile - True if file is category image (default: false)
   * @param {boolean} isAvatarFile - True if file is user avatar (default: false)
   * @param {number | null} requestId - Request ID if media attached to request (default: null)
   *
   * @returns {Promise<Media>} The created media record with:
   *   - Media ID, URL (S3 key), type
   *   - Related entity IDs
   *   - Flag fields (isShopLogo, etc.)
   *   - Created timestamp
   *
   * @throws {BadRequestException} If database save fails
   *
   * @remarks
   * - Uses Prisma transaction for data consistency
   * - Should be called immediately after successful S3 upload
   * - Links media to appropriate entities via foreign keys
   * - Multiple flag fields allow media categorization
   */
  async saveNewMediaFileToDatabase(
    mediaUrl: string,
    mediaType: MediaType,
    reviewId: number | null,
    userId: number | null,
    productVariantId: number | null,
    isShopLogo: boolean = false,
    isShopBanner: boolean = false,
    isCategoryFile: boolean = false,
    isAvatarFile: boolean = false,
    requestId: number | null = null,
  ): Promise<Media> {
    try {
      this.logger.log(
        'Saving new media file to database with url ' + mediaUrl + ' ...',
      );

      return await this.prismaService.$transaction(async (tx) => {
        const result = await tx.media.create({
          data: {
            url: mediaUrl,
            type: mediaType,
            reviewId: reviewId,
            userId: userId,
            productVariantId: productVariantId,
            isShopLogo: isShopLogo,
            isShopBanner: isShopBanner,
            isCategoryFile: isCategoryFile,
            isAvatarFile: isAvatarFile,
            requestId: requestId,
          },
        });

        if (!result) {
          throw new BadRequestException(
            'Failed to save media file to database',
          );
        }
        this.logger.log('Media file saved to database successfully');
        return result;
      });
    } catch (error) {
      this.logger.log('Error saving media file to database: ' + error);
      throw new BadRequestException('Failed to save media file to database');
    }
  }

  /**
   * Uploads a file to S3 bucket at specified location.
   *
   * This method performs the following operations:
   * 1. Logs upload attempt with file name and target location
   * 2. Calls internal s3_upload method
   * 3. Returns S3 upload response
   *
   * @param {Express.Multer.File} file - The uploaded file from multer containing:
   *   - buffer: File content
   *   - originalname: Original filename
   *   - mimetype: File MIME type
   * @param {string} targetLocation - S3 folder path (without filename)
   *
   * @returns {Promise<AWS.S3.ManagedUpload.SendData>} S3 upload result with:
   *   - Location: Full S3 URL
   *   - Key: S3 object key (path)
   *   - Bucket: Bucket name
   *   - ETag: File version identifier
   *
   * @throws {BadRequestException} If S3 upload fails
   *
   * @remarks
   * - File stored at: targetLocation + originalname
   * - Sets ContentDisposition to 'inline' for browser viewing
   * - Used by all specific upload methods (product, review, etc.)
   */
  async uploadFile(
    file: Express.Multer.File,
    targetLocation: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    try {
      this.logger.log(
        'uploading file ' +
          file.originalname +
          ' to s3 bucket folder ' +
          targetLocation,
      );
      const { originalname } = file;

      return await this.s3_upload(
        file.buffer,
        this.AWS_S3_BUCKET,
        targetLocation,
        originalname,
        file.mimetype,
      );
    } catch (error) {
      this.logger.log('Error uploading file to S3: ' + error);
      throw new BadRequestException('Failed to upload file to S3 bucket');
    }
  }

  /**
   * Internal method to upload file buffer to S3 bucket.
   *
   * This method performs the following operations:
   * 1. Constructs full S3 key (targetLocation + filename)
   * 2. Prepares S3 upload parameters
   * 3. Uploads file to S3 using AWS SDK
   * 4. Logs successful upload
   * 5. Returns S3 response
   *
   * @param {Express.Multer.File['buffer']} fileBuffer - File content as buffer
   * @param {string} bucket - S3 bucket name
   * @param {string} targetLocation - Folder path within bucket
   * @param {Express.Multer.File['originalname']} name - Original filename
   * @param {Express.Multer.File['mimetype']} mimetype - File MIME type
   *
   * @returns {Promise<AWS.S3.ManagedUpload.SendData>} S3 upload result with:
   *   - Location: Full S3 URL
   *   - Key: Final S3 object key
   *   - Bucket: Bucket name
   *   - ETag: File version identifier
   *
   * @throws {BadRequestException} If S3 upload fails
   *
   * @remarks
   * - Sets ContentDisposition to 'inline' for browser display
   * - ContentType set to original file mimetype
   * - Creates bucket configuration for specified region
   * - Used internally by uploadFile method
   */
  async s3_upload(
    fileBuffer: Express.Multer.File['buffer'],
    bucket: string,
    targetLocation: string,
    name: Express.Multer.File['originalname'],
    mimetype: Express.Multer.File['mimetype'],
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const finalTargetLocation = targetLocation + String(name);
    const params = {
      Bucket: bucket,
      Key: finalTargetLocation,
      Body: fileBuffer,
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: process.env.AWS_REGION!,
      },
    };

    try {
      const s3Response = await this.s3.upload(params).promise();
      this.logger.log('Uploaded file successfully to s3 bucket!! ');
      return s3Response;
    } catch (e) {
      console.log(e);
      throw new BadRequestException(`Failed to upload file to S3 bucket: ${e}`);
    }
  }

  /**
   * Lists all objects in a specific S3 bucket folder.
   *
   * This method performs the following operations:
   * 1. Logs list operation with folder path
   * 2. Prepares S3 listObjectsV2 parameters
   * 3. Retrieves list of objects from S3
   * 4. Logs object contents
   * 5. Returns list result
   *
   * @param {string} folderUrl - The S3 folder path to list (without trailing slash)
   *
   * @returns {Promise<PromiseResult<AWS.S3.ListObjectsV2Output, AWS.AWSError>>} S3 list result with:
   *   - Contents: Array of objects in folder
   *   - CommonPrefixes: Subfolders (if any)
   *   - KeyCount: Number of keys returned
   *   - IsTruncated: Whether more results exist
   *
   * @throws {BadRequestException} If S3 list operation fails
   *
   * @remarks
   * - Uses '/' delimiter for folder-like structure
   * - Prefix includes trailing '/' automatically
   * - Only lists immediate children (not recursive)
   * - Used for folder browsing and file management
   */
  async listFiles(
    folderUrl: string,
  ): Promise<PromiseResult<AWS.S3.ListObjectsV2Output, AWS.AWSError>> {
    try {
      this.logger.log('Listing objects in S3 bucket at folder ' + folderUrl);

      const params = {
        Bucket: this.AWS_S3_BUCKET,
        Delimiter: '/',
        Prefix: folderUrl + '/',
      };

      const result = await this.s3.listObjectsV2(params).promise();

      this.logger.log('List object: ' + JSON.stringify(result.Contents));
      return result;
    } catch (error) {
      this.logger.log('Error listing objects in S3 bucket: ' + error);
      throw new BadRequestException('Failed to list objects in S3 bucket');
    }
  }

  /**
   * Generates a signed URL for temporary file download from S3.
   *
   * This method performs the following operations:
   * 1. Logs download request
   * 2. Prepares S3 getSignedUrl parameters with expiration
   * 3. Generates signed URL from S3
   * 4. Logs generated URL
   * 5. Returns signed URL
   *
   * @param {string} targetFileUrl - The S3 key (path) of file to download
   *
   * @returns {Promise<string>} Signed URL with:
   *   - 30-second expiration time
   *   - Temporary access to private file
   *   - Pre-authenticated download link
   *
   * @throws {BadRequestException} If signed URL generation fails
   *
   * @remarks
   * - URL expires after 30 seconds for security
   * - Works for private bucket files
   * - Used for secure file downloads
   * - Each call generates new URL with fresh expiration
   */
  async downloadFile(targetFileUrl: string): Promise<string> {
    try {
      this.logger.log('Downloading file from S3 bucket ');

      const params = {
        Bucket: this.AWS_S3_BUCKET,
        Key: targetFileUrl,
        Expires: 30,
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);

      this.logger.log('Url to download file: ' + url);
      return url;
    } catch (error) {
      this.logger.log('Error downloading file from S3 bucket: ' + error);
      throw new BadRequestException('Failed to download file from S3 bucket');
    }
  }

  /**
   * Uploads a single product media file (image or video) to S3 and saves metadata.
   *
   * This method performs the following operations:
   * 1. Validates file is image or video type
   * 2. Determines target location based on media type
   * 3. Constructs folder path: shops/shop-products/product-[images|videos]/productVariantId/
   * 4. Uploads file to S3
   * 5. Saves media metadata to database
   * 6. Logs successful upload
   * 7. Returns S3 upload result
   *
   * @param {Express.Multer.File} file - The uploaded file
   * @param {string} adminId - The admin user ID performing upload
   * @param {string} productVariantId - The product variant ID this media belongs to
   *
   * @returns {Promise<AWS.S3.ManagedUpload.SendData>} S3 upload result with file location
   *
   * @throws {BadRequestException} If file is not image/video, upload fails, or database save fails
   *
   * @remarks
   * - Only accepts image/* and video/* MIME types
   * - Files organized by product variant ID in S3
   * - Creates database record linking media to product variant
   * - Used for product catalog media management
   */
  async uploadOneProductFile(
    file: Express.Multer.File,
    adminId: string,
    productVariantId: string,
  ) {
    try {
      let targetLocation: string = 'shops/shop-products/';

      // e.g. "image/png" or "video/mp4"
      const mime = file.mimetype;

      const isImage = mime.startsWith('image/');
      const isVideo = mime.startsWith('video/');

      if (!isImage && !isVideo) {
        throw new BadRequestException('Only image or video files are allowed');
      }

      if (isImage) {
        this.logger.log('Uploading an image file');
        targetLocation += 'product-images/';
      } else if (isVideo) {
        this.logger.log('Uploading a video file');
        targetLocation += 'product-videos/';
      }

      targetLocation += productVariantId.toString() + '/';

      this.logger.log(
        'Received request to upload file ' +
          file.originalname +
          ' to location ' +
          targetLocation,
      );
      const resultUploadFile = await this.uploadFile(file, targetLocation);

      const newMediaInDatabase: Media = await this.saveNewMediaFileToDatabase(
        resultUploadFile.Key,
        isImage ? MediaType.IMAGE : MediaType.VIDEO,
        null,
        Number(adminId),
        Number(productVariantId),
        false,
        false,
        false,
      );

      if (!newMediaInDatabase) {
        throw new BadRequestException('Cannot save media file to database');
      }
      this.logger.log('Upload one product file successfully');
      return resultUploadFile;
    } catch (error) {
      this.logger.log('Error uploading one product file: ' + error);
      throw new BadRequestException('Failed to upload one product media file');
    }
  }

  /**
   * Uploads shop logo file (image or video) to S3 and saves metadata.
   *
   * This method performs the following operations:
   * 1. Validates file is image or video type
   * 2. Determines target location: shops/shop-logo/logo-[images|videos]/
   * 3. Uploads file to S3
   * 4. Saves media metadata to database with isShopLogo flag
   * 5. Logs successful upload
   * 6. Returns S3 upload result
   *
   * @param {Express.Multer.File} file - The uploaded logo file
   * @param {string} adminId - The admin user ID performing upload
   *
   * @returns {Promise<AWS.S3.ManagedUpload.SendData>} S3 upload result with file location
   *
   * @throws {BadRequestException} If file is not image/video, upload fails, or database save fails
   *
   * @remarks
   * - Only accepts image/* and video/* MIME types
   * - Sets isShopLogo flag in database for identification
   * - Replaces previous shop logo (old file should be deleted separately)
   * - Used for shop branding customization
   */
  async uploadLogoShopFile(file: Express.Multer.File, adminId: string) {
    try {
      let targetLocation: string = 'shops/shop-logo/';
      const isShopLogo: boolean = true;

      // e.g. "image/png" or "video/mp4"
      const mime = file.mimetype;

      const isImage = mime.startsWith('image/');
      const isVideo = mime.startsWith('video/');

      if (!isImage && !isVideo) {
        throw new BadRequestException('Only image or video files are allowed');
      }

      if (isImage) {
        this.logger.log('Uploading an image file');
        targetLocation += 'logo-images/';
      } else if (isVideo) {
        this.logger.log('Uploading a video file');
        targetLocation += 'logo-videos/';
      }

      this.logger.log(
        'Received request to upload file ' +
          file.originalname +
          ' to location ' +
          targetLocation,
      );
      const resultUploadFile = await this.uploadFile(file, targetLocation);

      const newMediaInDatabase: Media = await this.saveNewMediaFileToDatabase(
        resultUploadFile.Key,
        isImage ? MediaType.IMAGE : MediaType.VIDEO,
        null,
        Number(adminId),
        null,
        isShopLogo,
        false,
        false,
      );

      if (!newMediaInDatabase) {
        throw new BadRequestException('Cannot save media file to database');
      }

      this.logger.log('Upload logo shop file successfully');
      return resultUploadFile;
    } catch (error) {
      this.logger.log('Error uploading logo shop media file: ' + error);
      throw new BadRequestException(
        'Failed to upload one logo shop media file',
      );
    }
  }

  /**
   * Uploads shop banner file (image or video) to S3 and saves metadata.
   *
   * This method performs the following operations:
   * 1. Validates file is image or video type
   * 2. Determines target location: shops/shop-banners/banner-[images|videos]/
   * 3. Uploads file to S3
   * 4. Saves media metadata to database with isShopBanner flag
   * 5. Logs successful upload
   * 6. Returns S3 upload result
   *
   * @param {Express.Multer.File} file - The uploaded banner file
   * @param {string} adminId - The admin user ID performing upload
   *
   * @returns {Promise<AWS.S3.ManagedUpload.SendData>} S3 upload result with file location
   *
   * @throws {BadRequestException} If file is not image/video, upload fails, or database save fails
   *
   * @remarks
   * - Only accepts image/* and video/* MIME types
   * - Sets isShopBanner flag in database for identification
   * - Used for shop homepage/promotional banners
   * - Supports multiple banners for carousel displays
   */
  async uploadBannerShopFile(file: Express.Multer.File, adminId: string) {
    try {
      let targetLocation: string = 'shops/shop-banners/';
      const isShopBanner: boolean = true;

      // e.g. "image/png" or "video/mp4"
      const mime = file.mimetype;

      const isImage = mime.startsWith('image/');
      const isVideo = mime.startsWith('video/');

      if (!isImage && !isVideo) {
        throw new BadRequestException('Only image or video files are allowed');
      }

      if (isImage) {
        this.logger.log('Uploading an image file');
        targetLocation += 'banner-images/';
      } else if (isVideo) {
        this.logger.log('Uploading a video file');
        targetLocation += 'banner-videos/';
      }

      this.logger.log(
        'Received request to upload file ' +
          file.originalname +
          ' to location ' +
          targetLocation,
      );
      const resultUploadFile = await this.uploadFile(file, targetLocation);

      const newMediaInDatabase: Media = await this.saveNewMediaFileToDatabase(
        resultUploadFile.Key,
        isImage ? MediaType.IMAGE : MediaType.VIDEO,
        null,
        Number(adminId),
        null,
        false,
        isShopBanner,
        false,
      );

      if (!newMediaInDatabase) {
        throw new BadRequestException('Cannot save media file to database');
      }

      this.logger.log('Upload banner shop file successfully');
      return resultUploadFile;
    } catch (error) {
      this.logger.log('Error uploading banner shop media file: ' + error);
      throw new BadRequestException(
        'Failed to upload one banner shop media file',
      );
    }
  }

  /**
   * Uploads multiple product media files (images or videos) to S3 in batch.
   *
   * This method performs the following operations:
   * 1. Validates at least one file provided
   * 2. Iterates through each file
   * 3. Validates each file is image or video type
   * 4. Determines target location based on media type
   * 5. Uploads each file to S3 at: shops/shop-products/product-[images|videos]/productVariantId/
   * 6. Saves each media metadata to database
   * 7. Collects all upload results
   * 8. Logs successful batch upload
   * 9. Returns array of S3 upload results
   *
   * @param {Express.Multer.File[]} files - Array of uploaded files
   * @param {string} adminId - The admin user ID performing upload
   * @param {string} productVariantId - The product variant ID these media belong to
   *
   * @returns {Promise<AWS.S3.ManagedUpload.SendData[]>} Array of S3 upload results
   *
   * @throws {BadRequestException} If no files provided, any file is not image/video, or any upload/save fails
   * @throws {NotFoundException} If batch upload process fails
   *
   * @remarks
   * - Processes files sequentially (not parallel)
   * - All files must be image/* or video/* types
   * - Each file gets separate database record
   * - Used for bulk product gallery uploads
   * - Transaction not used - partial uploads possible on failure
   */
  async uploadManyProductFile(
    files: Express.Multer.File[],
    adminId: string,
    productVariantId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData[]> {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('At least one file is required');
      }

      const results: AWS.S3.ManagedUpload.SendData[] = [];

      for (const file of files) {
        let targetLocation: string = 'shops/shop-products/';

        // e.g. "image/png" or "video/mp4"
        const mime = file.mimetype;

        const isImage = mime.startsWith('image/');
        const isVideo = mime.startsWith('video/');

        if (!isImage && !isVideo) {
          throw new BadRequestException(
            'Only image or video files are allowed',
          );
        }

        if (isImage) {
          this.logger.log('Uploading an image file');
          targetLocation += 'product-images/';
        } else if (isVideo) {
          this.logger.log('Uploading a video file');
          targetLocation += 'product-videos/';
        }

        targetLocation += productVariantId.toString() + '/';
        this.logger.log(
          'Received request to upload file ' +
            file.originalname +
            ' to location ' +
            targetLocation,
        );
        const resultUploadFile = await this.uploadFile(file, targetLocation);

        const newMediaInDatabase: Media = await this.saveNewMediaFileToDatabase(
          resultUploadFile.Key,
          isImage ? MediaType.IMAGE : MediaType.VIDEO,
          null,
          Number(adminId),
          Number(productVariantId),
          false,
          false,
          false,
        );

        if (!newMediaInDatabase) {
          throw new BadRequestException('Cannot save media file to database');
        }

        results.push(resultUploadFile);
      }

      this.logger.log('Uploaded many product files successfully');
      return results;
    } catch (error) {
      this.logger.log('Error uploading many product files: ' + error);
      throw new NotFoundException('Failed to upload many product media files');
    }
  }

  /**
   * Uploads a single category media file (image or video) to S3 and saves metadata.
   *
   * This method performs the following operations:
   * 1. Validates file is image or video type
   * 2. Determines target location: shops/shop-categories/category-[images|videos]/categoryId/
   * 3. Uploads file to S3
   * 4. Saves media metadata to database with isCategoryFile flag
   * 5. Logs successful upload
   * 6. Returns S3 upload result
   *
   * @param {Express.Multer.File} file - The uploaded category media file
   * @param {string} adminId - The admin user ID performing upload
   * @param {string} categoryId - The category ID this media belongs to
   *
   * @returns {Promise<AWS.S3.ManagedUpload.SendData>} S3 upload result with file location
   *
   * @throws {BadRequestException} If file is not image/video, upload fails, or database save fails
   *
   * @remarks
   * - Only accepts image/* and video/* MIME types
   * - Files organized by category ID in S3
   * - Sets isCategoryFile flag for identification
   * - Used for category thumbnail/banner images
   */
  async uploadOneCategoryFile(
    file: Express.Multer.File,
    adminId: string,
    categoryId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    try {
      let targetLocation: string = 'shops/shop-categories/';
      const isCategoryFile: boolean = true;

      // e.g. "image/png" or "video/mp4"
      const mime = file.mimetype;

      const isImage = mime.startsWith('image/');
      const isVideo = mime.startsWith('video/');

      if (!isImage && !isVideo) {
        throw new BadRequestException('Only image or video files are allowed');
      }

      if (isImage) {
        this.logger.log('Uploading an image file');
        targetLocation += 'category-images/';
      } else if (isVideo) {
        this.logger.log('Uploading a video file');
        targetLocation += 'category-videos/';
      }

      targetLocation += categoryId.toString() + '/';
      this.logger.log(
        'Received request to upload file ' +
          file.originalname +
          ' to location ' +
          targetLocation,
      );
      const resultUploadFile = await this.uploadFile(file, targetLocation);

      const newMediaInDatabase: Media = await this.saveNewMediaFileToDatabase(
        resultUploadFile.Key,
        isImage ? MediaType.IMAGE : MediaType.VIDEO,
        null,
        Number(adminId),
        null,
        false,
        false,
        isCategoryFile,
      );

      if (!newMediaInDatabase) {
        throw new BadRequestException('Cannot save media file to database');
      }

      this.logger.log('Upload one category file successfully');
      return resultUploadFile;
    } catch (error) {
      this.logger.log('Error uploading one category file: ' + error);
      throw new BadRequestException('Failed to upload one category media file');
    }
  }

  /**
   * Uploads a single user avatar file (image or video) to S3 and saves metadata.
   *
   * This method performs the following operations:
   * 1. Validates file is image or video type
   * 2. Determines target location: users/user-avatars/user-avatar-[images|videos]/userId/
   * 3. Uploads file to S3
   * 4. Saves media metadata to database with isAvatarFile flag
   * 5. Logs successful upload
   * 6. Returns S3 upload result
   *
   * @param {Express.Multer.File} file - The uploaded avatar file
   * @param {string} userId - The user ID this avatar belongs to
   *
   * @returns {Promise<AWS.S3.ManagedUpload.SendData>} S3 upload result with file location
   *
   * @throws {BadRequestException} If file is not image/video, upload fails, or database save fails
   *
   * @remarks
   * - Only accepts image/* and video/* MIME types
   * - Files organized by user ID in S3
   * - Sets isAvatarFile flag for identification
   * - Used for user profile pictures
   * - Replaces previous avatar (old file should be deleted separately)
   */
  async uploadOneUserAvatarFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    try {
      let targetLocation: string = 'users/user-avatars/';

      // e.g. "image/png" or "video/mp4"
      const mime = file.mimetype;

      const isImage = mime.startsWith('image/');
      const isVideo = mime.startsWith('video/');

      if (!isImage && !isVideo) {
        throw new BadRequestException('Only image or video files are allowed');
      }

      if (isImage) {
        this.logger.log('Uploading an image file');
        targetLocation += 'user-avatar-images/';
      } else if (isVideo) {
        this.logger.log('Uploading a video file');
        targetLocation += 'user-avatar-videos/';
      }

      targetLocation += userId.toString() + '/';
      this.logger.log(
        'Received request to upload file ' +
          file.originalname +
          ' to location ' +
          targetLocation,
      );
      const resultUploadFile = await this.uploadFile(file, targetLocation);

      const newMediaInDatabase: Media = await this.saveNewMediaFileToDatabase(
        resultUploadFile.Key,
        isImage ? MediaType.IMAGE : MediaType.VIDEO,
        null,
        Number(userId),
        null,
        false,
        false,
        false,
        true,
      );

      if (!newMediaInDatabase) {
        throw new BadRequestException('Cannot save media file to database');
      }

      this.logger.log('Upload one user avatar file successfully');
      return resultUploadFile;
    } catch (error) {
      this.logger.log('Error uploading one user avatar file: ' + error);
      throw new BadRequestException(
        'Failed to upload one user avatar media file',
      );
    }
  }

  /**
   * Uploads multiple user avatar files (images or videos) to S3 in batch.
   *
   * This method performs the following operations:
   * 1. Validates at least one file provided
   * 2. Iterates through each file
   * 3. Validates each file is image or video type
   * 4. Uploads each file to S3 at: users/user-avatars/user-avatar-[images|videos]/userId/
   * 5. Saves each media metadata to database with isAvatarFile flag
   * 6. Collects all upload results
   * 7. Logs successful batch upload
   * 8. Returns array of S3 upload results
   *
   * @param {Express.Multer.File[]} files - Array of uploaded avatar files
   * @param {string} userId - The user ID these avatars belong to
   *
   * @returns {Promise<AWS.S3.ManagedUpload.SendData[]>} Array of S3 upload results
   *
   * @throws {BadRequestException} If no files provided, any file is not image/video, or any upload/save fails
   *
   * @remarks
   * - Processes files sequentially (not parallel)
   * - All files must be image/* or video/* types
   * - Each file gets separate database record with isAvatarFile flag
   * - Used for multiple avatar options or avatar galleries
   */
  async uploadManyUserAvatarFile(
    files: Express.Multer.File[],
    userId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData[]> {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('At least one file is required');
      }

      const results: AWS.S3.ManagedUpload.SendData[] = [];

      for (const file of files) {
        let targetLocation: string = 'users/user-avatars/';

        // e.g. "image/png" or "video/mp4"
        const mime = file.mimetype;

        const isImage = mime.startsWith('image/');
        const isVideo = mime.startsWith('video/');

        if (!isImage && !isVideo) {
          throw new BadRequestException(
            'Only image or video files are allowed',
          );
        }

        if (isImage) {
          this.logger.log('Uploading an image file');
          targetLocation += 'user-avatar-images/';
        } else if (isVideo) {
          this.logger.log('Uploading a video file');
          targetLocation += 'user-avatar-videos/';
        }

        targetLocation += userId.toString() + '/';
        this.logger.log(
          'Received request to upload file ' +
            file.originalname +
            ' to location ' +
            targetLocation,
        );
        const resultUploadFile = await this.uploadFile(file, targetLocation);

        const newMediaInDatabase: Media = await this.saveNewMediaFileToDatabase(
          resultUploadFile.Key,
          isImage ? MediaType.IMAGE : MediaType.VIDEO,
          null,
          Number(userId),
          null,
          false,
          false,
          false,
          true,
        );

        if (!newMediaInDatabase) {
          throw new BadRequestException('Cannot save media file to database');
        }

        results.push(resultUploadFile);
      }

      this.logger.log('Uploaded many user avatar files successfully');
      return results;
    } catch (error) {
      this.logger.log('Error uploading many user avatar files: ' + error);
      throw new BadRequestException(
        'Failed to upload many user avatar media files',
      );
    }
  }

  /**
   * Uploads a single product review media file (image or video) to S3 and saves metadata.
   *
   * This method performs the following operations:
   * 1. Validates file is image or video type
   * 2. Determines target location: users/user-reviews/user-review-[images|videos]/userId/reviewId/
   * 3. Uploads file to S3
   * 4. Saves media metadata to database linked to review and user
   * 5. Logs successful upload
   * 6. Returns S3 upload result
   *
   * @param {Express.Multer.File} file - The uploaded review media file
   * @param {string} userId - The user ID who created the review
   * @param {string} reviewId - The review ID this media belongs to
   *
   * @returns {Promise<AWS.S3.ManagedUpload.SendData>} S3 upload result with file location
   *
   * @throws {BadRequestException} If file is not image/video, upload fails, or database save fails
   *
   * @remarks
   * - Only accepts image/* and video/* MIME types
   * - Files organized by userId/reviewId hierarchy in S3
   * - Links media to both review and user in database
   * - Used for customer product review photos/videos
   */
  async uploadOneProductReviewFile(
    file: Express.Multer.File,
    userId: string,
    reviewId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    try {
      let targetLocation: string = 'users/user-reviews/';

      // e.g. "image/png" or "video/mp4"
      const mime = file.mimetype;

      const isImage = mime.startsWith('image/');
      const isVideo = mime.startsWith('video/');

      if (!isImage && !isVideo) {
        throw new BadRequestException('Only image or video files are allowed');
      }

      if (isImage) {
        this.logger.log('Uploading an image file');
        targetLocation += 'user-review-images/';
      } else if (isVideo) {
        this.logger.log('Uploading a video file');
        targetLocation += 'user-review-videos/';
      }

      targetLocation += userId.toString() + '/' + reviewId.toString() + '/';

      this.logger.log(
        'Received request to upload file ' +
          file.originalname +
          ' to location ' +
          targetLocation,
      );
      const resultUploadFile = await this.uploadFile(file, targetLocation);

      const newMediaInDatabase: Media = await this.saveNewMediaFileToDatabase(
        resultUploadFile.Key,
        isImage ? MediaType.IMAGE : MediaType.VIDEO,
        Number(reviewId),
        Number(userId),
        null,
        false,
        false,
        false,
      );

      if (!newMediaInDatabase) {
        throw new BadRequestException('Cannot save media file to database');
      }

      this.logger.log('Upload one product review file successfully');
      return resultUploadFile;
    } catch (error) {
      this.logger.log('Error uploading one product review file: ' + error);
      throw new BadRequestException(
        'Failed to upload one product review media file',
      );
    }
  }

  /**
   * Uploads multiple product review media files (images or videos) to S3 in batch.
   *
   * This method performs the following operations:
   * 1. Validates at least one file provided
   * 2. Iterates through each file
   * 3. Validates each file is image or video type
   * 4. Uploads each file to S3 at: users/user-reviews/user-review-[images|videos]/userId/reviewId/
   * 5. Saves each media metadata to database linked to review, user, and product variant
   * 6. Collects all upload results
   * 7. Logs successful batch upload
   * 8. Returns array of S3 upload results
   *
   * @param {Express.Multer.File[]} files - Array of uploaded review media files
   * @param {string} userId - The user ID who created the review
   * @param {string} reviewId - The review ID these media belong to
   * @param {string} productVariantId - The product variant ID being reviewed
   *
   * @returns {Promise<AWS.S3.ManagedUpload.SendData[]>} Array of S3 upload results
   *
   * @throws {BadRequestException} If no files provided, any file is not image/video, or any upload/save fails
   *
   * @remarks
   * - Processes files sequentially (not parallel)
   * - All files must be image/* or video/* types
   * - Links to review, user, AND product variant in database
   * - Used for customer review photo/video galleries
   */
  async uploadManyReviewFile(
    files: Express.Multer.File[],
    userId: string,
    reviewId: string,
    productVariantId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData[]> {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('At least one file is required');
      }

      const results: AWS.S3.ManagedUpload.SendData[] = [];

      for (const file of files) {
        let targetLocation: string = 'users/user-reviews/';

        // e.g. "image/png" or "video/mp4"
        const mime = file.mimetype;

        const isImage = mime.startsWith('image/');
        const isVideo = mime.startsWith('video/');

        if (!isImage && !isVideo) {
          throw new BadRequestException(
            'Only image or video files are allowed',
          );
        }

        if (isImage) {
          this.logger.log('Uploading an image file');
          targetLocation += 'user-review-images/';
        } else if (isVideo) {
          this.logger.log('Uploading a video file');
          targetLocation += 'user-review-videos/';
        }

        targetLocation += userId.toString() + '/' + reviewId.toString() + '/';
        this.logger.log(
          'Received request to upload file ' +
            file.originalname +
            ' to location ' +
            targetLocation,
        );
        const resultUploadFile = await this.uploadFile(file, targetLocation);

        const newMediaInDatabase: Media = await this.saveNewMediaFileToDatabase(
          resultUploadFile.Key,
          isImage ? MediaType.IMAGE : MediaType.VIDEO,
          Number(reviewId),
          Number(userId),
          Number(productVariantId),
          false,
          false,
          false,
          false,
          null,
        );

        if (!newMediaInDatabase) {
          throw new BadRequestException('Cannot save media file to database');
        }

        results.push(resultUploadFile);
      }

      this.logger.log('Uploaded many review files successfully');
      return results;
    } catch (error) {
      this.logger.log('Error uploading many review files: ' + error);
      throw new BadRequestException('Failed to upload many review media files');
    }
  }

  /**
   * Uploads multiple customer request media files (images or videos) to S3 in batch.
   *
   * This method performs the following operations:
   * 1. Validates at least one file provided
   * 2. Iterates through each file
   * 3. Validates each file is image or video type
   * 4. Uploads each file to S3 at: users/user-requests/user-request-[images|videos]/userId/requestId/
   * 5. Saves each media metadata to database linked to request and user
   * 6. Collects all upload results
   * 7. Logs successful batch upload
   * 8. Returns array of S3 upload results
   *
   * @param {Express.Multer.File[]} files - Array of uploaded request media files
   * @param {string} userId - The user ID who created the request
   * @param {string} requestId - The request ID these media belong to
   *
   * @returns {Promise<AWS.S3.ManagedUpload.SendData[]>} Array of S3 upload results
   *
   * @throws {BadRequestException} If no files provided, any file is not image/video, or any upload/save fails
   *
   * @remarks
   * - Processes files sequentially (not parallel)
   * - All files must be image/* or video/* types
   * - Links to request and user in database
   * - Used for customer service request attachments
   * - Supports issue documentation with photos/videos
   */
  async uploadManyRequestFile(
    files: Express.Multer.File[],
    userId: string,
    requestId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData[]> {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('At least one file is required');
      }

      const results: AWS.S3.ManagedUpload.SendData[] = [];

      for (const file of files) {
        let targetLocation: string = 'users/user-requests/';

        // e.g. "image/png" or "video/mp4"
        const mime = file.mimetype;

        const isImage = mime.startsWith('image/');
        const isVideo = mime.startsWith('video/');

        if (!isImage && !isVideo) {
          throw new BadRequestException(
            'Only image or video files are allowed',
          );
        }

        if (isImage) {
          this.logger.log('Uploading an image file');
          targetLocation += 'user-request-images/';
        } else if (isVideo) {
          this.logger.log('Uploading a video file');
          targetLocation += 'user-request-videos/';
        }

        targetLocation += userId.toString() + '/' + requestId.toString() + '/';
        this.logger.log(
          'Received request to upload file ' +
            file.originalname +
            ' to location ' +
            targetLocation,
        );
        const resultUploadFile = await this.uploadFile(file, targetLocation);

        const newMediaInDatabase: Media = await this.saveNewMediaFileToDatabase(
          resultUploadFile.Key,
          isImage ? MediaType.IMAGE : MediaType.VIDEO,
          null,
          Number(userId),
          null,
          false,
          false,
          false,
          false,
          Number(requestId),
        );

        if (!newMediaInDatabase) {
          throw new BadRequestException('Cannot save media file to database');
        }

        results.push(resultUploadFile);
      }

      this.logger.log('Uploaded many request files successfully');
      return results;
    } catch (error) {
      this.logger.log('Error uploading many request files: ' + error);
      throw new BadRequestException(
        'Failed to upload many request media files',
      );
    }
  }

  /**
   * Deletes a file from S3 bucket by its key.
   *
   * This method performs the following operations:
   * 1. Logs deletion attempt with file key
   * 2. Prepares S3 deleteObject parameters
   * 3. Deletes object from S3
   * 4. Logs deletion result
   * 5. Returns S3 delete response
   *
   * @param {string} targetFileUrl - The S3 key (path) of file to delete
   *
   * @returns {Promise<AWS.S3.DeleteObjectOutput>} S3 deletion result with:
   *   - DeleteMarker: Whether deletion marker created
   *   - VersionId: Version ID of deleted object (if versioning enabled)
   *
   * @throws {BadRequestException} If S3 deletion fails
   *
   * @remarks
   * - Permanently deletes file from S3
   * - Does NOT delete database media record (do separately)
   * - Should be called BEFORE deleting media database record
   * - Used for media cleanup and replacement operations
   */
  async deleteFileFromS3(targetFileUrl: string) {
    try {
      this.logger.log('Deleting file from S3 bucket ' + targetFileUrl);

      const params = {
        Bucket: this.AWS_S3_BUCKET,
        Key: targetFileUrl,
      };

      const result = await this.s3.deleteObject(params).promise();
      this.logger.log('List deleted object: ' + JSON.stringify(result));
      this.logger.log('Deleted file from S3 bucket successfully');
      return result;
    } catch (error) {
      this.logger.log('Error deleting file from S3 bucket: ' + error);
      throw new BadRequestException('Failed to delete file from S3 bucket');
    }
  }
}
