import { Module } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { OrderItemsController } from './order-items.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Module({
  controllers: [OrderItemsController],
  providers: [OrderItemsService, PrismaService, AwsS3Service],
})
export class OrderItemsModule {}
