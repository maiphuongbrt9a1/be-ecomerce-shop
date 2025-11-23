import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShopOfficeDto } from './dto/create-shop-office.dto';
import { UpdateShopOfficeDto } from './dto/update-shop-office.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, ShopOffice } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

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
}
