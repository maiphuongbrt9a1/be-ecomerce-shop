import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('aws-s3')
export class AwsS3Controller {
  constructor(private readonly awsS3Service: AwsS3Service) {}

  // Source - https://stackoverflow.com/a
  // Posted by Willian, modified by community. See post 'Timeline' for change history
  // Retrieved 2025-11-23, License - CC BY-SA 4.0

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file) {
    return await this.awsS3Service.upload(file);
  }
}
