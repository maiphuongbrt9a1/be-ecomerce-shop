import { Module } from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { ProductVariantsController } from './product-variants.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Module({
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService, PrismaService, AwsS3Service],
})
export class ProductVariantsModule {}
