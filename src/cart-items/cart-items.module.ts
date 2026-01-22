import { Module } from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { CartItemsController } from './cart-items.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Module({
  controllers: [CartItemsController],
  providers: [CartItemsService, PrismaService, AwsS3Service],
})
export class CartItemsModule {}
