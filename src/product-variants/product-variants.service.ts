import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Media, Prisma, ProductVariants, Reviews } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Injectable()
export class ProductVariantsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  async create(
    file: Express.Multer.File,
    createProductVariantDto: CreateProductVariantDto,
    adminId: string,
  ): Promise<ProductVariants> {
    const productVariant = await this.prismaService.productVariants.create({
      data: { ...createProductVariantDto },
    });

    if (!productVariant) {
      throw new NotFoundException('Failed to create product variant');
    }

    const mediaForProductVariant = await this.awsService.uploadOneProductFile(
      file,
      adminId,
      productVariant.id.toString(),
    );

    if (!mediaForProductVariant) {
      throw new NotFoundException('Failed to upload product media file');
    }

    return productVariant;
  }

  async findAll(
    page: number,
    perPage: number,
  ): Promise<ProductVariants[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const productVariantList = await paginate<
      ProductVariants,
      Prisma.ProductVariantsFindManyArgs
    >(
      this.prismaService.productVariants,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return productVariantList.data;
  }

  async findOne(id: number): Promise<ProductVariants | null> {
    const productVariant = await this.prismaService.productVariants.findFirst({
      where: { id: id },
    });

    if (!productVariant) {
      throw new NotFoundException('Product Variant not found!');
    }

    return productVariant;
  }

  async update(
    id: number,
    updateProductVariantDto: UpdateProductVariantDto,
  ): Promise<ProductVariants> {
    const productVariant = await this.prismaService.productVariants.update({
      where: { id: id },
      data: { ...updateProductVariantDto },
    });

    return productVariant;
  }

  async remove(id: number): Promise<ProductVariants> {
    const productVariant = await this.prismaService.productVariants.delete({
      where: { id: id },
    });

    return productVariant;
  }

  async getReviewsOfProductVariant(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Reviews[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Reviews, Prisma.ReviewsFindManyArgs>(
      this.prismaService.reviews,
      { where: { productVariantId: id }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async getAllMediaOfProductVariant(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Media[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Media, Prisma.MediaFindManyArgs>(
      this.prismaService.media,
      { where: { productVariantId: id }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }
}
