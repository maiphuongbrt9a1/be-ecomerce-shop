import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Category, Prisma, Products } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const result = await this.prismaService.category.create({
        data: { ...createCategoryDto },
      });
      if (!result) {
        throw new NotFoundException('Failed to create category');
      }

      this.logger.log(`Category created with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to create category: ', error);
      throw new BadRequestException('Failed to create category');
    }
  }

  async findAll(page: number, perPage: number): Promise<Category[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Category, Prisma.CategoryFindManyArgs>(
        this.prismaService.category,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Fetched all categories - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all categories: ', error);
      throw new BadRequestException('Failed to fetch all categories');
    }
  }

  async findOne(id: number): Promise<Category | null> {
    try {
      const result = await this.prismaService.category.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Category not found!');
      }

      this.logger.log(`Fetched category with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch category with ID ${id}: `, error);
      throw new BadRequestException('Failed to fetch category');
    }
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    try {
      const result = await this.prismaService.category.update({
        where: { id: id },
        data: { ...updateCategoryDto },
      });

      this.logger.log(`Updated category with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update category with ID ${id}: `, error);
      throw new BadRequestException('Failed to update category');
    }
  }

  async remove(id: number): Promise<Category> {
    try {
      this.logger.log(`Removing category with ID: ${id}`);
      return await this.prismaService.category.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error(`Failed to remove category with ID ${id}: `, error);
      throw new BadRequestException('Failed to remove category');
    }
  }

  async getAllSubCategoriesOfCategory(id: number): Promise<Category[] | []> {
    try {
      const result = await this.prismaService.category.findMany({
        where: { parentId: id },
      });

      if (!result) {
        throw new NotFoundException('Sub-category not found!');
      }

      this.logger.log(`Fetched sub-categories for category ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch sub-categories for category ID ${id}: `,
        error,
      );
      throw new BadRequestException('Failed to fetch sub-categories');
    }
  }

  async getAllProductsOfCategory(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Products[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Products, Prisma.ProductsFindManyArgs>(
        this.prismaService.products,
        { where: { categoryId: id }, orderBy: { id: 'asc' } },
        { page: page },
      );

      if (!result) {
        throw new NotFoundException('Products not found!');
      }

      this.logger.log(`Fetched products for category ID: ${id}`);
      return result.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch products for category ID ${id}: `,
        error,
      );
      throw new BadRequestException('Failed to fetch products');
    }
  }
}
