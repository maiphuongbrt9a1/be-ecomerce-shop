import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Products, ProductVariants, Reviews } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  async create(
    files: Express.Multer.File[],
    createProductDto: CreateProductDto,
    adminId: string,
  ): Promise<Products> {
    const product = await this.prismaService.products.create({
      data: { ...createProductDto },
    });

    if (!product) {
      throw new NotFoundException('Failed to create product');
    }

    const mediaForProduct = await this.awsService.uploadManyProductFile(
      files,
      adminId,
      product.id.toString(),
    );

    if (!mediaForProduct) {
      throw new NotFoundException('Failed to upload product media file');
    }

    return product;
  }

  async findAll(page: number, perPage: number): Promise<Products[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Products, Prisma.ProductsFindManyArgs>(
      this.prismaService.products,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<Products | null> {
    const product = await this.prismaService.products.findFirst({
      where: { id: id },
    });

    if (!product) {
      throw new NotFoundException('Product not found!');
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Products> {
    const product = await this.prismaService.products.update({
      where: { id: id },
      data: { ...updateProductDto },
    });
    return product;
  }

  async remove(id: number): Promise<Products> {
    return await this.prismaService.products.delete({
      where: { id: id },
    });
  }

  async getAllProductVariantsOfProduct(
    id: number,
  ): Promise<ProductVariants[] | []> {
    const productVariantsList =
      await this.prismaService.productVariants.findMany({
        where: { productId: id },
      });

    if (!productVariantsList) {
      throw new NotFoundException('Product Variants not found!');
    }

    return productVariantsList;
  }

  async getAllReviewsOfProduct(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Reviews[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Reviews, Prisma.ReviewsFindManyArgs>(
      this.prismaService.reviews,
      { where: { productId: id }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }
}
