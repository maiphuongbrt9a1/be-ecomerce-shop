import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Logger,
  Get,
  UseGuards,
  Param,
  BadRequestException,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import * as AWS from 'aws-sdk';
import { Media, MediaType } from '@prisma/client';
import { PromiseResult } from 'aws-sdk/lib/request';

@Controller('aws-s3')
export class AwsS3Controller {
  constructor(private readonly awsS3Service: AwsS3Service) {}
  private readonly logger = new Logger(AwsS3Controller.name);

  @ApiOperation({
    summary:
      'Get all files from one folder of server. Do not contain / character in last. And folder url is in url field of media table but delete file name by front-end',
  })
  @ApiResponse({
    status: 200,
    description:
      'Get all files from one folder of server Do not contain / character in last. And folder url is in url field of media table. And folder url is in url field of media table but delete file name by front-end',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('/admin/list-files')
  async listFiles(
    @Query('folderUrl') folderUrl: string,
  ): Promise<PromiseResult<AWS.S3.ListObjectsV2Output, AWS.AWSError>> {
    this.logger.log('Listing content of bucket ');
    const responseData = await this.awsS3Service.listFiles(folderUrl);
    this.logger.log('Response Data ' + JSON.stringify(responseData.Contents));
    return responseData;
  }

  @ApiOperation({
    summary:
      'Download file from server. And target file url is in url field of media table',
  })
  @ApiResponse({
    status: 200,
    description:
      'Download file from server. And target file url is in url field of media table',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('/admin/download-file')
  async downloadFile(
    @Query('targetFileUrl') targetFileUrl: string,
  ): Promise<string> {
    this.logger.log('Downloading file from s3 bucket ');
    const responseData = await this.awsS3Service.downloadFile(targetFileUrl);
    this.logger.log('Response Data ' + responseData);
    return responseData;
  }

  @ApiOperation({
    summary:
      'Build a https link for media file stored in S3 bucket using its key',
  })
  @ApiResponse({
    status: 200,
    description:
      'Build a https link for media file stored in S3 bucket using its key',
  })
  @Get('/build-public-media-url')
  buildPublicMediaUrl(@Query('key') key: string): string {
    this.logger.log('Building public media URL for key ' + key);
    const responseData = this.awsS3Service.buildPublicMediaUrl(key);
    this.logger.log('Response Data ' + responseData);
    return responseData;
  }

  @ApiOperation({ summary: 'Upload logo shop file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload logo shop file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Logo shop file (image or video)',
        },
      },
      required: ['file'],
    },
  })
  @Post('/admin/:adminId/upload-logo-shop-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogoShopFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('adminId') adminId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
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
    const resultUploadFile = await this.awsS3Service.uploadFile(
      file,
      targetLocation,
    );

    const newMediaInDatabase: Media =
      await this.awsS3Service.saveNewMediaFileToDatabase(
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

  @ApiOperation({ summary: 'Upload banner shop file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload banner shop file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Banner shop file (image or video)',
        },
      },
      required: ['file'],
    },
  })
  @Post('/admin/:adminId/upload-banner-shop-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBannerShopFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('adminId') adminId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
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
    const resultUploadFile = await this.awsS3Service.uploadFile(
      file,
      targetLocation,
    );

    const newMediaInDatabase: Media =
      await this.awsS3Service.saveNewMediaFileToDatabase(
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

  @ApiOperation({ summary: 'Upload one product file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload one product file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Product file (image or video)',
        },
      },
      required: ['file'],
    },
  })
  @Post('/admin/:adminId/upload-one-product-file/:productVariantId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOneProductFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('adminId') adminId: string,
    @Param('productVariantId') productVariantId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    return await this.awsS3Service.uploadOneProductFile(
      file,
      adminId,
      productVariantId,
    );
  }

  @ApiOperation({ summary: 'Upload many product file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload many product file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Product files (images or videos, max 10)',
        },
      },
      required: ['files'],
    },
  })
  @Post('/admin/:adminId/upload-many-product-file/:productVariantId')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadManyProductFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('adminId') adminId: string,
    @Param('productVariantId') productVariantId: string,
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
      const resultUploadFile = await this.awsS3Service.uploadFile(
        file,
        targetLocation,
      );

      const newMediaInDatabase: Media =
        await this.awsS3Service.saveNewMediaFileToDatabase(
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

  @ApiOperation({ summary: 'Upload one category file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload one category file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Category file (image or video)',
        },
      },
      required: ['file'],
    },
  })
  @Post('/admin/:adminId/upload-one-category-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOneCategoryFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('adminId') adminId: string,
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
    const resultUploadFile = await this.awsS3Service.uploadFile(
      file,
      targetLocation,
    );

    const newMediaInDatabase: Media =
      await this.awsS3Service.saveNewMediaFileToDatabase(
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

  ////////////////User upload endpoints can be added here//////////////

  @ApiOperation({ summary: 'Upload one user avatar file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload one user avatar file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'User avatar file (image or video)',
        },
      },
      required: ['file'],
    },
  })
  @Post('/user/:userId/upload-one-user-avatar-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOneUserAvatarFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId: string,
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
    const resultUploadFile = await this.awsS3Service.uploadFile(
      file,
      targetLocation,
    );

    const newMediaInDatabase: Media =
      await this.awsS3Service.saveNewMediaFileToDatabase(
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

  @ApiOperation({ summary: 'Upload many user avatar file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload many user avatar file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'User avatar files (images or videos, max 10)',
        },
      },
      required: ['files'],
    },
  })
  @Post('/user/:userId/upload-many-user-avatar-file')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadManyUserAvatarFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('userId') userId: string,
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
      const resultUploadFile = await this.awsS3Service.uploadFile(
        file,
        targetLocation,
      );

      const newMediaInDatabase: Media =
        await this.awsS3Service.saveNewMediaFileToDatabase(
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

  @ApiOperation({ summary: 'Upload one review file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload one review file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Review file (image or video)',
        },
      },
      required: ['file'],
    },
  })
  @Post('/user/:userId/upload-one-review-file/:reviewId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOneProductReviewFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId: string,
    @Param('reviewId') reviewId: string,
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
    const resultUploadFile = await this.awsS3Service.uploadFile(
      file,
      targetLocation,
    );

    const newMediaInDatabase: Media =
      await this.awsS3Service.saveNewMediaFileToDatabase(
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

  @ApiOperation({ summary: 'Upload many review product file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload many review product file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Review files (images or videos, max 10)',
        },
      },
      required: ['files'],
    },
  })
  @Post('/user/:userId/upload-many-review-file/:reviewId')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadManyReviewFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('userId') userId: string,
    @Param('reviewId') reviewId: string,
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
      const resultUploadFile = await this.awsS3Service.uploadFile(
        file,
        targetLocation,
      );

      const newMediaInDatabase: Media =
        await this.awsS3Service.saveNewMediaFileToDatabase(
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

      results.push(resultUploadFile);
    }

    return results;
  }
}
