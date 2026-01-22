import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { CartItems, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { CartItemsWithProductVariantAndMedia } from '@/helpers/types/types';
import { formatMediaFieldWithLogging } from '@/helpers/utils';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Injectable()
export class CartItemsService {
  private readonly logger = new Logger(CartItemsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  async create(
    createCartItemDto: CreateCartItemDto,
  ): Promise<CartItemsWithProductVariantAndMedia> {
    try {
      const result = await this.prismaService.cartItems.create({
        data: { ...createCartItemDto },
      });

      if (!result) {
        throw new BadRequestException('Failed to create cart item');
      }

      const returnResult = await this.prismaService.cartItems.findUnique({
        where: { id: result.id },
        include: {
          productVariant: {
            include: {
              media: true,
            },
          },
        },
      });

      if (!returnResult) {
        throw new NotFoundException('Cart item not found after creation');
      }

      // generate https link for media field
      if (
        returnResult.productVariant &&
        returnResult.productVariant.media &&
        returnResult.productVariant.media.length > 0
      ) {
        returnResult.productVariant.media = formatMediaFieldWithLogging(
          returnResult.productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'cart item',
          returnResult.id,
          this.logger,
        );
      }

      this.logger.log(`Cart item created with ID: ${result.id}`);
      return returnResult;
    } catch (error) {
      this.logger.error('Failed to create cart item: ', error);
      throw new BadRequestException('Failed to create cart item');
    }
  }

  async findAll(
    page: number,
    perPage: number,
  ): Promise<CartItemsWithProductVariantAndMedia[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        CartItemsWithProductVariantAndMedia,
        Prisma.CartItemsFindManyArgs
      >(
        this.prismaService.cartItems,
        {
          include: {
            productVariant: {
              include: {
                media: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate https link for media field in each cart item
      for (let index = 0; index < result.data.length; index++) {
        const cartItem = result.data[index];
        if (
          cartItem.productVariant &&
          cartItem.productVariant.media &&
          cartItem.productVariant.media.length > 0
        ) {
          cartItem.productVariant.media = formatMediaFieldWithLogging(
            cartItem.productVariant.media,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'cart item',
            cartItem.id,
            this.logger,
          );
        }
      }

      this.logger.log(
        `Fetched all cart items - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all cart items: ', error);
      throw new BadRequestException('Failed to fetch all cart items');
    }
  }

  async findOne(
    id: number,
  ): Promise<CartItemsWithProductVariantAndMedia | null> {
    try {
      const result = await this.prismaService.cartItems.findFirst({
        include: {
          productVariant: {
            include: {
              media: true,
            },
          },
        },
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Cart item not found!');
      }

      // generate https link for media field
      if (
        result.productVariant &&
        result.productVariant.media &&
        result.productVariant.media.length > 0
      ) {
        result.productVariant.media = formatMediaFieldWithLogging(
          result.productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'cart item',
          result.id,
          this.logger,
        );
      }

      this.logger.log(`Fetched cart item with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch cart item with ID ${id}: `, error);
      throw new BadRequestException('Failed to fetch cart item');
    }
  }

  async update(
    id: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItemsWithProductVariantAndMedia> {
    try {
      const result = await this.prismaService.cartItems.update({
        where: { id: id },
        data: { ...updateCartItemDto },
      });

      if (!result) {
        throw new BadRequestException('Cart item has failed to update!');
      }

      const returnResult = await this.prismaService.cartItems.findUnique({
        where: { id: result.id },
        include: {
          productVariant: {
            include: {
              media: true,
            },
          },
        },
      });

      if (!returnResult) {
        throw new NotFoundException('Cart item not found after updated!');
      }
      // generate https link for media field
      if (
        returnResult.productVariant &&
        returnResult.productVariant.media &&
        returnResult.productVariant.media.length > 0
      ) {
        returnResult.productVariant.media = formatMediaFieldWithLogging(
          returnResult.productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'cart item',
          returnResult.id,
          this.logger,
        );
      }

      this.logger.log(`Updated cart item with ID: ${id}`);
      return returnResult;
    } catch (error) {
      this.logger.error(`Failed to update cart item with ID ${id}: `, error);
      throw new BadRequestException('Failed to update cart item');
    }
  }

  async remove(id: number): Promise<CartItems> {
    try {
      this.logger.log(`Removing cart item with ID: ${id}`);
      return await this.prismaService.cartItems.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error(`Failed to remove cart item with ID ${id}: `, error);
      throw new BadRequestException('Failed to remove cart item');
    }
  }
}
