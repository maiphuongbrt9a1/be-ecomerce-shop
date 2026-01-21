import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Products } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import { formatMediaField, formatMediaFieldWithLogging } from '@/helpers/utils';
import {
  ProductsWithProductVariantsAndTheirMedia,
  ProductVariantsWithMediaInformation,
  ReviewsWithMedia,
} from '@/helpers/types/types';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Products> {
    try {
      const product = await this.prismaService.products.create({
        data: { ...createProductDto },
      });

      if (!product) {
        throw new NotFoundException('Failed to create product');
      }

      this.logger.log(`Product created with ID: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.log(`Error creating product: ${error}`);
      throw new BadRequestException('Failed to create product');
    }
  }

  async findAll(
    page: number,
    perPage: number,
  ): Promise<ProductsWithProductVariantsAndTheirMedia[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ProductsWithProductVariantsAndTheirMedia,
        Prisma.ProductsFindManyArgs
      >(
        this.prismaService.products,
        {
          include: {
            productVariants: {
              include: {
                media: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full http url for media files of each product variant in products
      for (let i = 0; i < result.data.length; i++) {
        const productVariantList = result.data[i].productVariants;
        for (let j = 0; j < productVariantList.length; j++) {
          const productVariant = productVariantList[j];
          const originalMedia = productVariant.media; // Store original media for comparison
          productVariant.media = formatMediaField(
            productVariant.media,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
          );

          // Check if the media field has changed
          if (originalMedia !== productVariant.media) {
            this.logger.log(
              `Media field changed for product variant ID: ${productVariant.id}`,
            );
          }
        }
      }

      this.logger.log(`Fetched products - Page: ${page}, PerPage: ${perPage}`);
      return result.data;
    } catch (error) {
      this.logger.log(`Error fetching products: ${error}`);
      throw new BadRequestException('Failed to fetch products');
    }
  }

  async findOne(
    id: number,
  ): Promise<ProductsWithProductVariantsAndTheirMedia | null> {
    try {
      const product = await this.prismaService.products.findFirst({
        include: {
          productVariants: {
            include: {
              media: true,
            },
          },
        },
        where: { id: id },
      });

      if (!product) {
        throw new NotFoundException('Product not found!');
      }

      // generate full http url for media files
      for (let i = 0; i < product.productVariants.length; i++) {
        const productVariant = product.productVariants[i];
        const originalMedia = productVariant.media; // Store original media for comparison
        productVariant.media = formatMediaField(
          productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
        );

        // Check if the media field has changed
        if (originalMedia !== productVariant.media) {
          this.logger.log(
            `Media field changed for product variant ID: ${productVariant.id}`,
          );
        }
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
  ): Promise<ProductVariantsWithMediaInformation[] | []> {
    try {
      const productVariantsList =
        await this.prismaService.productVariants.findMany({
          include: {
            media: true,
          },
          where: { productId: id },
        });

      if (!productVariantsList || productVariantsList.length === 0) {
        throw new NotFoundException('Product Variants not found!');
      }

      // generate full http url for media files
      for (let i = 0; i < productVariantsList.length; i++) {
        const productVariant = productVariantsList[i];
        const originalMedia = productVariant.media; // Store original media for comparison
        productVariant.media = formatMediaField(
          productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
        );

        // Check if the media field has changed
        if (originalMedia !== productVariant.media) {
          this.logger.log(
            `Media field changed for product variant ID: ${productVariant.id}`,
          );
        }
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
  ): Promise<ReviewsWithMedia[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ReviewsWithMedia,
        Prisma.ReviewsFindManyArgs
      >(
        this.prismaService.reviews,
        {
          include: { media: true },
          where: { productId: id },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full http url for media files of each review
      for (let i = 0; i < result.data.length; i++) {
        const review = result.data[i];
        review.media = formatMediaFieldWithLogging(
          review.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'Review',
          review.id,
          this.logger,
        );
      }

      this.logger.log(`Reviews fetched for product ID: ${id}`);
      return result.data;
    } catch (error) {
      this.logger.log(`Error fetching reviews for product ID ${id}: ${error}`);
      throw new BadRequestException('Failed to fetch product reviews');
    }
  }
}
