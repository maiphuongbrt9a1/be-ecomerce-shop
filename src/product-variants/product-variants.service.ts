import {
  Logger,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Media, Prisma, ProductVariants, Reviews } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import { formatMediaField, formatMediaFieldWithLogging } from '@/helpers/utils';
import { ProductVariantsWithMediaInformation } from '@/helpers/types/types';

@Injectable()
export class ProductVariantsService {
  private readonly logger = new Logger(ProductVariantsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  async create(
    files: Express.Multer.File[],
    createProductVariantDto: CreateProductVariantDto,
    adminId: string,
  ): Promise<ProductVariants> {
    // create product variant first
    try {
      const productVariant = await this.prismaService.productVariants.create({
        data: { ...createProductVariantDto },
      });

      if (!productVariant) {
        this.logger.log('Failed to create product variant');
        throw new NotFoundException('Failed to create product variant');
      }

      // upload media files for product variant if have supplied files and create new product variant successfully
      const mediaForProductVariant =
        await this.awsService.uploadManyProductFile(
          files,
          adminId,
          productVariant.id.toString(),
        );

      if (!mediaForProductVariant) {
        this.logger.log('Failed to upload product media file');
        throw new NotFoundException('Failed to upload product media file');
      }

      // return new product variant
      const newProductVariant =
        await this.prismaService.productVariants.findUnique({
          include: { media: true },
          where: { id: productVariant.id },
        });

      if (!newProductVariant) {
        this.logger.log('Failed to retrieve new product variant');
        throw new NotFoundException('Failed to retrieve new product variant');
      }

      // generate full http url for media files
      newProductVariant.media = formatMediaField(
        newProductVariant.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
      );

      this.logger.log(
        'Product variant created successfully with id: ' + productVariant.id,
      );

      return newProductVariant;
    } catch (error) {
      this.logger.log('Error creating product variant: ' + error);
      throw new NotFoundException('Failed to create product variant');
    }
  }

  async findAll(
    page: number,
    perPage: number,
  ): Promise<ProductVariantsWithMediaInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const productVariantList = await paginate<
        ProductVariantsWithMediaInformation,
        Prisma.ProductVariantsFindManyArgs
      >(
        this.prismaService.productVariants,
        {
          include: {
            media: true,
          },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full http url for media files
      for (let i = 0; i < productVariantList.data.length; i++) {
        const productVariant = productVariantList.data[i];
        productVariant.media = formatMediaFieldWithLogging(
          productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'product variant',
          productVariant.id,
          this.logger,
        );
      }

      this.logger.log(
        `Retrieved ${productVariantList.data.length} product variants successfully`,
      );
      return productVariantList.data;
    } catch (error) {
      this.logger.log('Error retrieving product variants: ' + error);
      throw new NotFoundException('Failed to retrieve product variants');
    }
  }

  async findOne(
    id: number,
  ): Promise<ProductVariantsWithMediaInformation | null> {
    try {
      const productVariant = await this.prismaService.productVariants.findFirst(
        {
          include: {
            media: true,
          },
          where: { id: id },
        },
      );

      if (!productVariant) {
        throw new NotFoundException('Product Variant not found!');
      }

      // generate full http url for media files
      const originalMedia = productVariant.media; // Store original media for comparison
      productVariant.media = formatMediaField(
        productVariant.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
      );

      if (originalMedia !== productVariant.media) {
        this.logger.log(
          `Media field changed for product variant ID: ${productVariant.id}`,
        );
      }

      this.logger.log('Retrieved product variant successfully with id: ' + id);
      return productVariant;
    } catch (error) {
      this.logger.log('Error retrieving product variant: ' + error);
      throw new NotFoundException('Failed to retrieve product variant');
    }
  }

  async update(
    files: Express.Multer.File[],
    id: number,
    updateProductVariantDto: UpdateProductVariantDto,
    adminId: string,
  ): Promise<ProductVariantsWithMediaInformation> {
    try {
      // Find old product variant with media files and prepare to delete selected media files
      const oldProductVariant =
        await this.prismaService.productVariants.findUnique({
          include: { media: true },
          where: { id: id },
        });
      const oldMediaFiles = oldProductVariant?.media;

      // dto have media ids to delete if you want to delete some media files and upload new files
      const { mediaIdsToDelete, ...updateData } = updateProductVariantDto;

      // update product variant data
      const newProductVariant = await this.prismaService.productVariants.update(
        {
          include: { media: true },
          where: { id: id },
          data: updateData,
        },
      );

      if (!newProductVariant) {
        throw new NotFoundException('Failed to update product variant');
      }

      // update media files if have new uploaded files
      if (files && files.length > 0) {
        const mediaUploadForProductVariant =
          await this.awsService.uploadManyProductFile(
            files,
            adminId,
            id.toString(),
          );

        if (!mediaUploadForProductVariant) {
          throw new NotFoundException('Failed to upload product media files');
        }
      }

      // Delete media files from s3 and database if update product variant and media files successfully
      if (mediaIdsToDelete && mediaIdsToDelete.length > 0) {
        const mediaFilesToDelete = oldMediaFiles?.filter((media) =>
          mediaIdsToDelete.includes(media.id),
        );

        if (mediaFilesToDelete && mediaFilesToDelete.length > 0) {
          for (const media of mediaFilesToDelete) {
            await this.awsService.deleteFileFromS3(media.url);
          }

          await this.prismaService.media.deleteMany({
            where: { id: { in: mediaIdsToDelete } },
          });
        }
      }

      // generate full http url for media files
      const resultProductVariant =
        await this.prismaService.productVariants.findUnique({
          include: { media: true },
          where: { id: newProductVariant.id },
        });

      if (!resultProductVariant) {
        throw new NotFoundException(
          'Failed to retrieve updated product variant',
        );
      }

      const originalMedia = resultProductVariant.media; // Store original media for comparison
      resultProductVariant.media = formatMediaField(
        resultProductVariant.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
      );

      if (originalMedia !== resultProductVariant.media) {
        this.logger.log(
          `Media field changed for product variant ID: ${resultProductVariant.id}`,
        );
      }

      // return updated product variant
      this.logger.log(
        'Product variant updated successfully with id: ' +
          resultProductVariant.id,
      );

      return resultProductVariant;
    } catch (error) {
      this.logger.log('Error updating product variant: ' + error);
      throw new NotFoundException('Failed to update product variant');
    }
  }

  async remove(id: number): Promise<ProductVariants> {
    try {
      // delete media files from s3 first
      const mediaFilesToDelete = await this.prismaService.media.findMany({
        where: { productVariantId: id },
        select: { url: true, id: true },
      });

      try {
        for (const media of mediaFilesToDelete) {
          await this.awsService.deleteFileFromS3(media.url);
        }
      } catch (error) {
        this.logger.log('Error deleting media files from S3: ' + error);
        throw new BadRequestException('Failed to delete media files from S3');
      }

      // delete product variant and its media files, reviews from postgresql db
      const productVariant = await this.prismaService.productVariants.delete({
        where: { id: id },
      });

      this.logger.log('Product variant deleted successfully with id: ' + id);
      return productVariant;
    } catch (error) {
      this.logger.log('Error deleting product variant: ' + error);
      throw new BadRequestException('Failed to delete product variant');
    }
  }

  async getReviewsOfProductVariant(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Reviews[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Reviews, Prisma.ReviewsFindManyArgs>(
        this.prismaService.reviews,
        {
          include: {
            media: true,
          },
          where: { productVariantId: id },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );
      this.logger.log(
        `Retrieved ${result.data.length} reviews for product variant id: ${id} successfully`,
      );
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving reviews: ' + error);
      throw new BadRequestException('Failed to retrieve reviews');
    }
  }

  async getAllMediaOfProductVariant(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Media[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Media, Prisma.MediaFindManyArgs>(
        this.prismaService.media,
        { where: { productVariantId: id }, orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Retrieved ${result.data.length} media files for product variant id: ${id} successfully`,
      );
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving media files: ' + error);
      throw new BadRequestException('Failed to retrieve media files');
    }
  }
}
