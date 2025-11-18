import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { OrderItems, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class OrderItemsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItems> {
    const result = await this.prismaService.orderItems.create({
      data: { ...createOrderItemDto },
    });

    return result;
  }

  async findAll(page: number, perPage: number): Promise<OrderItems[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<OrderItems, Prisma.OrderItemsFindManyArgs>(
      this.prismaService.orderItems,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<OrderItems | null> {
    const result = await this.prismaService.orderItems.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new NotFoundException('Order item not found!');
    }

    return result;
  }

  async update(
    id: number,
    updateOrderItemDto: UpdateOrderItemDto,
  ): Promise<OrderItems> {
    const result = await this.prismaService.orderItems.update({
      where: { id: id },
      data: { ...updateOrderItemDto },
    });
    return result;
  }

  async remove(id: number): Promise<OrderItems> {
    return await this.prismaService.orderItems.delete({
      where: { id: id },
    });
  }
}
