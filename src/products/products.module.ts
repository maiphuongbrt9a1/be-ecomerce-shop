import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, AwsS3Service],
})
export class ProductsModule {}
