import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Products, ProductVariants, Reviews } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  async create(
    files: Express.Multer.File[],
    createProductDto: CreateProductDto,
    adminId: string,
  ): Promise<Products> {
    try {
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

      this.logger.log(`Product created with ID: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.log(`Error creating product: ${error}`);
      throw new BadRequestException('Failed to create product');
    }
  }

  async findAll(page: number, perPage: number): Promise<Products[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Products, Prisma.ProductsFindManyArgs>(
        this.prismaService.products,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      return result.data;
    } catch (error) {
      this.logger.log(`Error fetching products: ${error}`);
      throw new BadRequestException('Failed to fetch products');
    }
  }

  async findOne(id: number): Promise<Products | null> {
    try {
      const product = await this.prismaService.products.findFirst({
        where: { id: id },
      });

      if (!product) {
        throw new NotFoundException('Product not found!');
      }

      this.logger.log(`Product fetched with ID: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.log(`Error fetching product with ID ${id}: ${error}`);
      throw new BadRequestException('Failed to fetch product');
    }
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Products> {
    try {
      const product = await this.prismaService.products.update({
        where: { id: id },
        data: { ...updateProductDto },
      });

      this.logger.log(`Product updated with ID: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.log(`Error updating product with ID ${id}: ${error}`);
      throw new BadRequestException('Failed to update product');
    }
  }

  async remove(id: number): Promise<Products> {
    try {
      this.logger.log(`Deleting product with ID: ${id}`);
      return await this.prismaService.products.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log(`Error deleting product with ID ${id}: ${error}`);
      throw new BadRequestException('Failed to delete product');
    }
  }

  async getAllProductVariantsOfProduct(
    id: number,
  ): Promise<ProductVariants[] | []> {
    try {
      const productVariantsList =
        await this.prismaService.productVariants.findMany({
          where: { productId: id },
        });

      if (!productVariantsList) {
        throw new NotFoundException('Product Variants not found!');
      }

      this.logger.log(`Product Variants fetched for product ID: ${id}`);
      return productVariantsList;
    } catch (error) {
      this.logger.log(
        `Error fetching product variants for product ID ${id}: ${error}`,
      );
      throw new BadRequestException('Failed to fetch product variants');
    }
  }

  async getAllReviewsOfProduct(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Reviews[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Reviews, Prisma.ReviewsFindManyArgs>(
        this.prismaService.reviews,
        { where: { productId: id }, orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(`Reviews fetched for product ID: ${id}`);
      return result.data;
    } catch (error) {
      this.logger.log(`Error fetching reviews for product ID ${id}: ${error}`);
      throw new BadRequestException('Failed to fetch product reviews');
    }
  }
}
