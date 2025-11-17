import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, ProductVariants } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class ProductVariantsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createProductVariantDto: CreateProductVariantDto,
  ): Promise<ProductVariants> {
    const productVariant = await this.prismaService.productVariants.create({
      data: { ...createProductVariantDto },
    });

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
}
