import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { ShipmentsService } from '@/shipments/shipments.service';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, ShipmentsService, AwsS3Service],
})
export class OrdersModule {}
