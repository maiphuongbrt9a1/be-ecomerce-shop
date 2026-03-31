import { Module } from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { CartItemsController } from './cart-items.controller';
import { AwsS3Module } from '@/aws-s3/aws-s3.module';

@Module({
  imports: [AwsS3Module],
  controllers: [CartItemsController],
  providers: [CartItemsService],
})
export class CartItemsModule {}
