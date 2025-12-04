import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Logger,
  Get,
  UseGuards,
  Param,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import * as AWS from 'aws-sdk';
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
  @Post('/admin/:adminId/upload-logo-shop-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogoShopFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('adminId') adminId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    return await this.awsS3Service.uploadLogoShopFile(file, adminId);
  }

  @ApiOperation({ summary: 'Upload banner shop file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload banner shop file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Post('/admin/:adminId/upload-banner-shop-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBannerShopFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('adminId') adminId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    return await this.awsS3Service.uploadBannerShopFile(file, adminId);
  }

  @ApiOperation({ summary: 'Upload one product file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload one product file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
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
  @Post('/admin/:adminId/upload-many-product-file/:productVariantId')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadManyProductFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('adminId') adminId: string,
    @Param('productVariantId') productVariantId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData[]> {
    return await this.awsS3Service.uploadManyProductFile(
      files,
      adminId,
      productVariantId,
    );
  }

  @ApiOperation({ summary: 'Upload one category file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload one category file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Post('/admin/:adminId/upload-one-category-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOneCategoryFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('adminId') adminId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    return await this.awsS3Service.uploadOneCategoryFile(file, adminId);
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
  @Post('/user/:userId/upload-one-user-avatar-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOneUserAvatarFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    return await this.awsS3Service.uploadOneUserAvatarFile(file, userId);
  }

  @ApiOperation({ summary: 'Upload many user avatar file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload many user avatar file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @Post('/user/:userId/upload-many-user-avatar-file')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadManyUserAvatarFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('userId') userId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData[]> {
    return await this.awsS3Service.uploadManyUserAvatarFile(files, userId);
  }

  @ApiOperation({ summary: 'Upload one review file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload one review file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @Post('/user/:userId/upload-one-review-file/:reviewId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOneProductReviewFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId: string,
    @Param('reviewId') reviewId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    return await this.awsS3Service.uploadOneProductReviewFile(
      file,
      userId,
      reviewId,
    );
  }

  @ApiOperation({ summary: 'Upload many review product file to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload many review product file to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @Post('/user/:userId/upload-many-review-file/:reviewId')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadManyReviewFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('userId') userId: string,
    @Param('reviewId') reviewId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData[]> {
    return await this.awsS3Service.uploadManyReviewFile(
      files,
      userId,
      reviewId,
    );
  }

  @ApiOperation({ summary: 'Upload many media file for request to server' })
  @ApiResponse({
    status: 200,
    description: 'Upload many media file for request to server',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @Post('/user/:userId/upload-many-request-file/:requestId')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadManyRequestFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('userId') userId: string,
    @Param('requestId') requestId: string,
  ): Promise<AWS.S3.ManagedUpload.SendData[]> {
    return await this.awsS3Service.uploadManyRequestFile(
      files,
      userId,
      requestId,
    );
  }
}
