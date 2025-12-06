import * as AWS from 'aws-sdk';
import { Logger, Injectable, BadRequestException } from '@nestjs/common';
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

  buildPublicMediaUrl(key: string): string {
    return `https://${process.env.BUCKET_S3_NAME!}.s3.${process.env.AWS_REGION!}.amazonaws.com/${key}`;
  }

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
        throw new BadRequestException('Failed to save media file to database');
      }

      return result;
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    targetLocation: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
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
  }

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

  async listFiles(
    folderUrl: string,
  ): Promise<PromiseResult<AWS.S3.ListObjectsV2Output, AWS.AWSError>> {
    this.logger.log('Listing objects in S3 bucket at folder ' + folderUrl);

    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Delimiter: '/',
      Prefix: folderUrl + '/',
    };

    const result = await this.s3.listObjectsV2(params).promise();

    console.log('List object: ' + JSON.stringify(result.Contents));
    return result;
  }

  async downloadFile(targetFileUrl: string): Promise<string> {
    this.logger.log('Downloading file from S3 bucket ');

    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Key: targetFileUrl,
      Expires: 30,
    };

    const url = await this.s3.getSignedUrlPromise('getObject', params);

    console.log('Url to download file: ' + url);
    return url;
  }

  async uploadOneProductFile(
    file: Express.Multer.File,
    adminId: string,
    productVariantId: string,
  ) {
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

    targetLocation +=
      adminId.toString() + '/' + productVariantId.toString() + '/';

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

    return resultUploadFile;
  }

  async uploadLogoShopFile(file: Express.Multer.File, adminId: string) {
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

    return resultUploadFile;
  }

  async uploadBannerShopFile(file: Express.Multer.File, adminId: string) {
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

    return resultUploadFile;
  }

  async uploadManyProductFile(
    files: Express.Multer.File[],
    adminId: string,
    productVariantId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData[]> {
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
        throw new BadRequestException('Only image or video files are allowed');
      }

      if (isImage) {
        this.logger.log('Uploading an image file');
        targetLocation += 'product-images/';
      } else if (isVideo) {
        this.logger.log('Uploading a video file');
        targetLocation += 'product-videos/';
      }

      targetLocation +=
        adminId.toString() + '/' + productVariantId.toString() + '/';
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

    return results;
  }

  async uploadOneCategoryFile(
    file: Express.Multer.File,
    adminId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
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

    targetLocation += adminId.toString() + '/';
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

    return resultUploadFile;
  }

  async uploadOneUserAvatarFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
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

    return resultUploadFile;
  }

  async uploadManyUserAvatarFile(
    files: Express.Multer.File[],
    userId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData[]> {
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

      results.push(resultUploadFile);
    }

    return results;
  }

  async uploadOneProductReviewFile(
    file: Express.Multer.File,
    userId: string,
    reviewId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
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

    return resultUploadFile;
  }

  async uploadManyReviewFile(
    files: Express.Multer.File[],
    userId: string,
    reviewId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData[]> {
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
        false,
        null,
      );

      if (!newMediaInDatabase) {
        throw new BadRequestException('Cannot save media file to database');
      }

      results.push(resultUploadFile);
    }

    return results;
  }

  async uploadManyRequestFile(
    files: Express.Multer.File[],
    userId: string,
    requestId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData[]> {
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
        throw new BadRequestException('Only image or video files are allowed');
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

    return results;
  }
}
