import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { AwsS3Module } from '@/aws-s3/aws-s3.module';

@Module({
  imports: [AwsS3Module],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
