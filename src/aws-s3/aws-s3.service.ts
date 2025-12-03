import { CreateAwsS3Dto } from './dto/create-aws-s3.dto';
import { UpdateAwsS3Dto } from './dto/update-aws-s3.dto';
import * as AWS from 'aws-sdk';
import { Logger, Injectable, BadRequestException } from '@nestjs/common';
import { Media, MediaType } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

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
      'uploading file ' + file + ' to s3 bucket folder ' + targetLocation,
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
    fileBuffer,
    bucket,
    targetLocation,
    name,
    mimetype,
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
      let s3Response = await this.s3.upload(params).promise();
      this.logger.log('Uploaded file successfully to s3 bucket!! ');
      return s3Response;
    } catch (e) {
      console.log(e);
      throw new BadRequestException(
        `Failed to upload file to S3 bucket: ${e.message}`,
      );
    }
  }

  async listFiles(folderUrl: string): Promise<any> {
    this.logger.log('Listing objects in S3 bucket at folder ' + folderUrl);

    var params = {
      Bucket: this.AWS_S3_BUCKET,
      Delimiter: '/',
      Prefix: folderUrl + '/',
    };

    let result = await this.s3.listObjectsV2(params).promise();

    console.log('List object: ' + result);
    return result;
  }

  async downloadFile(targetFileUrl: string): Promise<any> {
    this.logger.log('Downloading file from S3 bucket ');

    var params = {
      Bucket: this.AWS_S3_BUCKET!,
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
        file +
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
}
