import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  OrderItems,
  Orders,
  Payments,
  Prisma,
  Requests,
  Shipments,
} from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import {
  OrderWithFullInformation,
  OrderWithFullInformationInclude,
} from '@/helpers/types/types';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Orders> {
    try {
      const result = await this.prismaService.orders.create({
        data: { ...createOrderDto },
      });

      this.logger.log(`Order created with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to create order: ', error);
      throw new BadRequestException('Failed to create order');
    }
  }

  async findAll(page: number, perPage: number): Promise<Orders[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Orders, Prisma.OrdersFindManyArgs>(
        this.prismaService.orders,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Fetched page ${page} of orders with ${perPage} orders per page.`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all orders: ', error);
      throw new BadRequestException('Failed to fetch all orders');
    }
  }

  async findOne(id: number): Promise<Orders | null> {
    try {
      const result = await this.prismaService.orders.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Order not found!');
      }

      this.logger.log(`Fetched order with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch order with ID ${id}: `, error);
      throw new BadRequestException('Failed to fetch order');
    }
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Orders> {
    try {
      const result = await this.prismaService.orders.update({
        where: { id: id },
        data: { ...updateOrderDto },
      });

      this.logger.log(`Updated order with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update order with ID ${id}: `, error);
      throw new BadRequestException('Failed to update order');
    }
  }

  async remove(id: number): Promise<Orders> {
    try {
      this.logger.log(`Deleting order with ID: ${id}`);
      return await this.prismaService.orders.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error(`Failed to delete order with ID ${id}: `, error);
      throw new BadRequestException('Failed to delete order');
    }
  }

  async getOrderDetailInformation(
    id: number,
  ): Promise<OrderWithFullInformation | null> {
    try {
      const result = await this.prismaService.orders.findFirst({
        where: { id: id },
        include: OrderWithFullInformationInclude,
      });

      if (!result) {
        throw new NotFoundException('Order not found!');
      }

      this.logger.log(`Fetched order detail information with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch order detail information with ID ${id}: `,
        error,
      );
      throw new BadRequestException('Failed to fetch order detail information');
    }
  }

  async getAllOrdersWithDetailInformation(
    page: number,
    perPage: number,
  ): Promise<OrderWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrderWithFullInformation,
        Prisma.OrdersFindManyArgs
      >(
        this.prismaService.orders,
        {
          include: OrderWithFullInformationInclude,
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      return result.data;
    } catch (error) {
      this.logger.error(
        'Failed to fetch all orders with detail information: ',
        error,
      );
      throw new BadRequestException(
        'Failed to fetch all orders with detail information',
      );
    }
  }

  async getOrderItemListDetailInformation(
    id: number,
  ): Promise<OrderItems[] | []> {
    try {
      const result = await this.prismaService.orderItems.findMany({
        where: { orderId: id },
      });

      if (!result) {
        throw new NotFoundException('Order items not found!');
      }

      this.logger.log(`Fetched order items for order ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch order items for order ID ${id}: `,
        error,
      );
      throw new BadRequestException('Failed to fetch order items');
    }
  }

  async getOrderShipmentsDetailInformation(
    id: number,
  ): Promise<Shipments[] | []> {
    try {
      const result = await this.prismaService.shipments.findMany({
        where: { orderId: id },
      });

      if (!result) {
        throw new NotFoundException('Order shipments not found!');
      }

      this.logger.log(`Fetched order shipments for order ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch order shipments for order ID ${id}: `,
        error,
      );
      throw new BadRequestException('Failed to fetch order shipments');
    }
  }

  async getOrderPaymentDetailInformation(id: number): Promise<Payments[] | []> {
    try {
      const result = await this.prismaService.payments.findMany({
        where: { orderId: id },
      });

      if (!result) {
        throw new NotFoundException('Order payments not found!');
      }

      this.logger.log(`Fetched order payments for order ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch order payments for order ID ${id}: `,
        error,
      );
      throw new BadRequestException('Failed to fetch order payments');
    }
  }

  async getOrderRequestDetailInformation(id: number): Promise<Requests[] | []> {
    try {
      const result = await this.prismaService.requests.findMany({
        where: { orderId: id },
        include: {
          returnRequest: true,
        },
      });

      if (!result) {
        throw new NotFoundException('Order requests not found!');
      }

      this.logger.log(`Fetched order requests for order ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch order requests for order ID ${id}: `,
        error,
      );
      throw new BadRequestException('Failed to fetch order requests');
    }
  }
}
