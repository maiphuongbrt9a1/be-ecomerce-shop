import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { AwsS3Module } from '@/aws-s3/aws-s3.module';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [AwsS3Module, NotificationModule],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
