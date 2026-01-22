import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { OrderItems, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { OrderItemsWithVariantAndMediaInformation } from '@/helpers/types/types';
import { formatMediaFieldWithLogging } from '@/helpers/utils';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Injectable()
export class OrderItemsService {
  private readonly logger = new Logger(OrderItemsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  async create(
    createOrderItemDto: CreateOrderItemDto,
  ): Promise<OrderItemsWithVariantAndMediaInformation> {
    try {
      const result = await this.prismaService.orderItems.create({
        data: { ...createOrderItemDto },
      });

      if (!result) {
        throw new BadRequestException('Failed to create order item');
      }

      const returnResult = await this.prismaService.orderItems.findUnique({
        include: {
          productVariant: {
            include: {
              media: true,
            },
          },
        },
        where: { id: result.id },
      });

      if (!returnResult) {
        throw new NotFoundException('Order item not found after creation');
      }

      // generate full http url for media files
      if (
        returnResult.productVariant &&
        returnResult.productVariant.media &&
        returnResult.productVariant.media.length > 0
      ) {
        returnResult.productVariant.media = formatMediaFieldWithLogging(
          returnResult.productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'order item',
          returnResult.id,
          this.logger,
        );
      }

      this.logger.log(`Order item created with ID: ${result.id}`);
      return returnResult;
    } catch (error) {
      this.logger.error('Failed to create order item: ', error);
      throw new BadRequestException('Failed to create order item');
    }
  }

  async findAll(
    page: number,
    perPage: number,
  ): Promise<OrderItemsWithVariantAndMediaInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrderItemsWithVariantAndMediaInformation,
        Prisma.OrderItemsFindManyArgs
      >(
        this.prismaService.orderItems,
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

      for (let index = 0; index < result.data.length; index++) {
        const orderItem = result.data[index];
        if (
          orderItem.productVariant &&
          orderItem.productVariant.media &&
          orderItem.productVariant.media.length > 0
        ) {
          orderItem.productVariant.media = formatMediaFieldWithLogging(
            orderItem.productVariant.media,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'order item',
            orderItem.id,
            this.logger,
          );
        }
      }

      this.logger.log(
        `Fetched all order items - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all order items: ', error);
      throw new BadRequestException('Failed to fetch all order items');
    }
  }

  async findOne(
    id: number,
  ): Promise<OrderItemsWithVariantAndMediaInformation | null> {
    try {
      const result = await this.prismaService.orderItems.findFirst({
        where: { id: id },
        include: {
          productVariant: {
            include: {
              media: true,
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundException('Order item not found!');
      }

      if (
        result.productVariant &&
        result.productVariant.media &&
        result.productVariant.media.length > 0
      ) {
        result.productVariant.media = formatMediaFieldWithLogging(
          result.productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'order item',
          result.id,
          this.logger,
        );
      }

      this.logger.log(`Fetched order item with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch order item: ', error);
      throw new BadRequestException('Failed to fetch order item');
    }
  }

  async update(
    id: number,
    updateOrderItemDto: UpdateOrderItemDto,
  ): Promise<OrderItemsWithVariantAndMediaInformation> {
    try {
      const result = await this.prismaService.orderItems.update({
        where: { id: id },
        data: { ...updateOrderItemDto },
      });

      if (!result) {
        throw new BadRequestException('Failed to update order item');
      }

      const returnResult = await this.prismaService.orderItems.findUnique({
        include: {
          productVariant: {
            include: {
              media: true,
            },
          },
        },
        where: { id: result.id },
      });

      if (!returnResult) {
        throw new NotFoundException('Order item not found after update');
      }

      // generate full http url for media files
      if (
        returnResult.productVariant &&
        returnResult.productVariant.media &&
        returnResult.productVariant.media.length > 0
      ) {
        returnResult.productVariant.media = formatMediaFieldWithLogging(
          returnResult.productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'order item',
          returnResult.id,
          this.logger,
        );
      }

      this.logger.log(`Updated order item with ID: ${id}`);
      return returnResult;
    } catch (error) {
      this.logger.error('Failed to update order item: ', error);
      throw new BadRequestException('Failed to update order item');
    }
  }

  async remove(id: number): Promise<OrderItems> {
    try {
      this.logger.log(`Removing order item with ID: ${id}`);
      return await this.prismaService.orderItems.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error('Failed to remove order item: ', error);
      throw new BadRequestException('Failed to remove order item');
    }
  }
}
