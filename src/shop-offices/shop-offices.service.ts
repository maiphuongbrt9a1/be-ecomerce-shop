import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
  private readonly logger = new Logger(ShopOfficesService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(createShopOfficeDto: CreateShopOfficeDto): Promise<ShopOffice> {
    try {
      const result = await this.prismaService.shopOffice.create({
        data: { ...createShopOfficeDto },
      });

      this.logger.log('Shop office created successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error creating shop office', error);
      throw new BadRequestException('Failed to create shop office');
    }
  }

  async findAll(page: number, perPage: number): Promise<ShopOffice[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<ShopOffice, Prisma.ShopOfficeFindManyArgs>(
        this.prismaService.shopOffice,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Shop offices retrieved successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving shop offices', error);
      throw new BadRequestException('Failed to retrieve shop offices');
    }
  }

  async findOne(id: number): Promise<ShopOffice | null> {
    try {
      const result = await this.prismaService.shopOffice.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Shop office not found!');
      }

      this.logger.log('Shop office retrieved successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving shop office', error);
      throw new BadRequestException('Failed to retrieve shop office');
    }
  }

  async update(
    id: number,
    updateShopOfficeDto: UpdateShopOfficeDto,
  ): Promise<ShopOffice> {
    try {
      const result = await this.prismaService.shopOffice.update({
        where: { id: id },
        data: { ...updateShopOfficeDto },
      });
      this.logger.log('Shop office updated successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error updating shop office', error);
      throw new BadRequestException('Failed to update shop office');
    }
  }

  async remove(id: number): Promise<ShopOffice> {
    try {
      this.logger.log('Shop office deleted successfully', id);
      return await this.prismaService.shopOffice.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log('Error deleting shop office', error);
      throw new BadRequestException('Failed to delete shop office');
    }
  }

  async findAllManagersOfShopOffice(id: number): Promise<User[] | []> {
    try {
      const result = await this.prismaService.user.findMany({
        where: { shopOfficeId: id, role: { in: ['ADMIN', 'OPERATOR'] } },
      });

      if (!result) {
        throw new NotFoundException('Shop office managers not found!');
      }
      this.logger.log('Shop office managers retrieved successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving shop office managers', error);
      throw new BadRequestException('Failed to retrieve shop office managers');
    }
  }

  async findAddressOfShopOffice(id: number): Promise<Address | null> {
    try {
      const result = await this.prismaService.address.findFirst({
        where: { shopOfficeId: id },
      });

      if (!result) {
        throw new NotFoundException('Shop office address not found!');
      }

      this.logger.log('Shop office address retrieved successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving shop office address', error);
      throw new BadRequestException('Failed to retrieve shop office address');
    }
  }

  async findAllProductsOfShopOffice(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Products[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Products, Prisma.ProductsFindManyArgs>(
        this.prismaService.products,
        { where: { shopOfficeId: id }, orderBy: { id: 'asc' } },
        { page: page },
      );

      if (!result.data) {
        throw new NotFoundException('Shop office products is empty!');
      }

      this.logger.log('Shop office products retrieved successfully', id);
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving shop office products', error);
      throw new BadRequestException('Failed to retrieve shop office products');
    }
  }

  async findAllCategoryOfShopOffice(id: number): Promise<Category[] | []> {
    try {
      const result = await this.prismaService.category.findMany({
        where: { shopOfficeId: id },
      });

      if (!result) {
        throw new NotFoundException('Shop office categories is empty!');
      }

      this.logger.log('Shop office categories retrieved successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving shop office categories', error);
      throw new BadRequestException(
        'Failed to retrieve shop office categories',
      );
    }
  }

  async findAllProductsOfCategoryOfShopOffice(
    shopId: number,
    categoryId: number,
    page: number,
    perPage: number,
  ): Promise<ProductsOfCategoryOfShopOffice[] | []> {
    try {
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
        throw new NotFoundException(
          'Shop office products of category is empty!',
        );
      }

      this.logger.log(
        'Shop office products of category retrieved successfully',
        shopId,
      );
      return result.data;
    } catch (error) {
      this.logger.log(
        'Error retrieving shop office products of category',
        error,
      );
      throw new BadRequestException(
        'Failed to retrieve shop office products of category',
      );
    }
  }
}
