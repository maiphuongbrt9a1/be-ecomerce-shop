import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, PrismaService, AwsS3Service],
})
export class ReviewsModule {}
