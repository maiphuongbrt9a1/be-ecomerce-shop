import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Module({
  controllers: [RequestsController],
  providers: [RequestsService, PrismaService, AwsS3Service],
})
export class RequestsModule {}
