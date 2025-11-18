import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Orders, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Orders> {
    const result = await this.prismaService.orders.create({
      data: { ...createOrderDto },
    });

    return result;
  }

  async findAll(page: number, perPage: number): Promise<Orders[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Orders, Prisma.OrdersFindManyArgs>(
      this.prismaService.orders,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<Orders | null> {
    const result = await this.prismaService.orders.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new NotFoundException('Order not found!');
    }

    return result;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Orders> {
    const result = await this.prismaService.orders.update({
      where: { id: id },
      data: { ...updateOrderDto },
    });
    return result;
  }

  async remove(id: number): Promise<Orders> {
    return await this.prismaService.orders.delete({
      where: { id: id },
    });
  }
}
