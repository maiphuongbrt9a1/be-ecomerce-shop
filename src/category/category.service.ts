import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Category, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const result = await this.prismaService.category.create({
      data: { ...createCategoryDto },
    });

    return result;
  }

  async findAll(page: number, perPage: number): Promise<Category[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Category, Prisma.CategoryFindManyArgs>(
      this.prismaService.category,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<Category | null> {
    const result = await this.prismaService.category.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new NotFoundException('Category not found!');
    }

    return result;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const result = await this.prismaService.category.update({
      where: { id: id },
      data: { ...updateCategoryDto },
    });
    return result;
  }

  async remove(id: number): Promise<Category> {
    return await this.prismaService.category.delete({
      where: { id: id },
    });
  }

  async getAllSubCategoriesOfCategory(id: number): Promise<Category[] | []> {
    const result = await this.prismaService.category.findMany({
      where: { parentId: id },
    });

    if (!result) {
      throw new NotFoundException('Sub-category not found!');
    }

    return result;
  }
}
