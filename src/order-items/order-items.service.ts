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

@Injectable()
export class OrderItemsService {
  private readonly logger = new Logger(OrderItemsService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItems> {
    try {
      const result = await this.prismaService.orderItems.create({
        data: { ...createOrderItemDto },
      });

      this.logger.log(`Order item created with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to create order item: ', error);
      throw new BadRequestException('Failed to create order item');
    }
  }

  async findAll(page: number, perPage: number): Promise<OrderItems[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<OrderItems, Prisma.OrderItemsFindManyArgs>(
        this.prismaService.orderItems,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Fetched all order items - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all order items: ', error);
      throw new BadRequestException('Failed to fetch all order items');
    }
  }

  async findOne(id: number): Promise<OrderItems | null> {
    try {
      const result = await this.prismaService.orderItems.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Order item not found!');
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
  ): Promise<OrderItems> {
    try {
      const result = await this.prismaService.orderItems.update({
        where: { id: id },
        data: { ...updateOrderItemDto },
      });

      this.logger.log(`Updated order item with ID: ${id}`);
      return result;
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
