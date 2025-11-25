import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Prisma,
  Products,
  ProductVariants,
  Reviews,
  Vouchers,
} from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Products> {
    const product = await this.prismaService.products.create({
      data: { ...createProductDto },
    });

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
