import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { AwsS3Module } from '@/aws-s3/aws-s3.module';

@Module({
  imports: [AwsS3Module],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
