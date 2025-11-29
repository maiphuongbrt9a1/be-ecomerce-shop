import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShopOfficeDto } from './dto/create-shop-office.dto';
import { UpdateShopOfficeDto } from './dto/update-shop-office.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Address,
  Category,
  Prisma,
  Products,
  ShopOffice,
  User,
} from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { ProductsOfCategoryOfShopOffice } from '@/helpers/types/types';

@Injectable()
export class ShopOfficesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createShopOfficeDto: CreateShopOfficeDto): Promise<ShopOffice> {
    const result = await this.prismaService.shopOffice.create({
      data: { ...createShopOfficeDto },
    });

    return result;
  }

  async findAll(page: number, perPage: number): Promise<ShopOffice[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<ShopOffice, Prisma.ShopOfficeFindManyArgs>(
      this.prismaService.shopOffice,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<ShopOffice | null> {
    const result = await this.prismaService.shopOffice.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new NotFoundException('Shop office not found!');
    }

    return result;
  }

  async update(
    id: number,
    updateShopOfficeDto: UpdateShopOfficeDto,
  ): Promise<ShopOffice> {
    const result = await this.prismaService.shopOffice.update({
      where: { id: id },
      data: { ...updateShopOfficeDto },
    });
    return result;
  }

  async remove(id: number): Promise<ShopOffice> {
    return await this.prismaService.shopOffice.delete({
      where: { id: id },
    });
  }

  async findAllManagersOfShopOffice(id: number): Promise<User[] | []> {
    const result = await this.prismaService.user.findMany({
      where: { shopOfficeId: id, role: { in: ['ADMIN', 'OPERATOR'] } },
    });

    if (!result) {
      throw new NotFoundException('Shop office managers not found!');
    }

    return result;
  }

  async findAddressOfShopOffice(id: number): Promise<Address | null> {
    const result = await this.prismaService.address.findFirst({
      where: { shopOfficeId: id },
    });

    if (!result) {
      throw new NotFoundException('Shop office address not found!');
    }

    return result;
  }

  async findAllProductsOfShopOffice(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Products[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Products, Prisma.ProductsFindManyArgs>(
      this.prismaService.products,
      { where: { shopOfficeId: id }, orderBy: { id: 'asc' } },
      { page: page },
    );

    if (!result.data) {
      throw new NotFoundException('Shop office products is empty!');
    }

    return result.data;
  }

  async findAllCategoryOfShopOffice(id: number): Promise<Category[] | []> {
    const result = await this.prismaService.category.findMany({
      where: { shopOfficeId: id },
    });

    if (!result) {
      throw new NotFoundException('Shop office categories is empty!');
    }

    return result;
  }

  async findAllProductsOfCategoryOfShopOffice(
    shopId: number,
    categoryId: number,
    page: number,
    perPage: number,
  ): Promise<ProductsOfCategoryOfShopOffice[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<
      ProductsOfCategoryOfShopOffice,
      Prisma.ShopOfficeFindManyArgs
    >(
      this.prismaService.shopOffice,
      {
        select: {
          products: { where: { categoryId: categoryId } },
        },
        where: { id: shopId },
        orderBy: { id: 'asc' },
      },
      { page: page },
    );

    if (!result.data) {
      throw new NotFoundException('Shop office products of category is empty!');
    }

    return result.data;
  }
}
