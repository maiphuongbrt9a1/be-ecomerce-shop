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
  Orders,
  OrderStatus,
  Payments,
  PaymentStatus,
  Prisma,
  Requests,
  ShipmentStatus,
} from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import {
  OrderItemsWithVariantAndMediaInformation,
  OrdersWithFullInformation,
  OrdersWithFullInformationInclude,
  ShipmentsWithFullInformation,
} from '@/helpers/types/types';
import dayjs from 'dayjs';
import {
  formatMediaFieldWithLogging,
  formatMediaFieldWithLoggingForOrders,
  formatMediaFieldWithLoggingForShipments,
} from '@/helpers/utils';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import { ShipmentsService } from '@/shipments/shipments.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
    private readonly shipmentsService: ShipmentsService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
  ): Promise<OrdersWithFullInformation> {
    try {
      // prepare data for create new order
      return await this.prismaService.$transaction(async (tx) => {
        const userId = BigInt(createOrderDto.userId);
        const newShippingAddress = await tx.address.create({
          data: {
            street: createOrderDto.street,
            ward: createOrderDto.ward,
            district: createOrderDto.district,
            province: createOrderDto.province,
            zipCode: createOrderDto.zipCode,
            country: createOrderDto.country,
            userId: userId,
          },
        });
        const processByStaff = null;
        const orderDate = new Date();
        const orderStatus = OrderStatus.PENDING;

        /// is fixing this shipping fee
        const shippingFee = 0;
        let subTotal = 0;
        let discount = 0;
        let totalAmount = 0;

        for (const item of createOrderDto.orderItems) {
          subTotal += item.totalPrice;
          discount += item.discountValue ? item.discountValue : 0;
        }

        totalAmount = subTotal + shippingFee - discount;

        // create new order
        const result = await tx.orders.create({
          data: {
            userId: userId,
            shippingAddressId: newShippingAddress.id,
            processByStaffId: processByStaff,
            orderDate: orderDate,
            status: orderStatus,
            subTotal: subTotal,
            shippingFee: shippingFee,
            discount: discount,
            totalAmount: totalAmount,
          },
        });

        // please create order items after creating order
        for (const item of createOrderDto.orderItems) {
          await tx.orderItems.create({
            data: {
              orderId: result.id,
              productVariantId: BigInt(item.productVariantId),
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              discountValue: item.discountValue ? item.discountValue : 0,
            },
          });
        }

        // please create payments after creating order
        await tx.payments.create({
          data: {
            orderId: result.id,
            transactionId: `${Date.now()}-${result.id}-${userId}-${Math.floor(
              Math.random() * 10000000,
            )}`,
            paymentMethod: createOrderDto.paymentMethod,
            amount: result.totalAmount,
            status: PaymentStatus.PENDING,
          },
        });

        // if COD, please create shipment after creating order
        // if other payment method, shipment will be created after payment is successful
        // please check update payment method in payments service to see more details about creating shipment after payment is successful
        if (createOrderDto.paymentMethod === 'COD') {
          await tx.shipments.create({
            data: {
              orderId: result.id,
              processByStaffId: processByStaff,
              estimatedDelivery: dayjs().add(1, 'days').toDate(),
              estimatedShipDate: dayjs().add(2, 'days').toDate(),
              carrier: createOrderDto.carrier,
              trackingNumber: `${Date.now()}-${result.id}-${userId}-${Math.floor(
                Math.random() * 10000000,
              )}`,
              status: ShipmentStatus.WAITING_FOR_PICKUP,
            },
          });
        }

        // log and return result
        const returnResult = await tx.orders.findUnique({
          where: { id: result.id },
          include: OrdersWithFullInformationInclude,
        });

        if (!returnResult) {
          throw new NotFoundException('Order not found after creation!');
        }

        this.logger.log(`Order created with ID: ${returnResult.id}`);
        return returnResult;
      });
    } catch (error) {
      this.logger.error('Failed to create order: ', error);
      throw new BadRequestException('Failed to create order');
    }
  }

  async findAll(
    page: number,
    perPage: number,
  ): Promise<OrdersWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrdersWithFullInformation,
        Prisma.OrdersFindManyArgs
      >(
        this.prismaService.orders,
        {
          include: OrdersWithFullInformationInclude,
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      result.data = formatMediaFieldWithLoggingForOrders(
        result.data,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
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

  async findOne(id: number): Promise<OrdersWithFullInformation | null> {
    try {
      const result = await this.prismaService.orders.findFirst({
        where: { id: id },
        include: OrdersWithFullInformationInclude,
      });

      if (!result) {
        throw new NotFoundException('Order not found!');
      }

      const returnResult = formatMediaFieldWithLoggingForOrders(
        [result],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      if (!returnResult) {
        throw new NotFoundException('Order error after formatting media!');
      }

      this.logger.log(`Fetched order with ID: ${id}`);
      return returnResult;
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
  ): Promise<OrdersWithFullInformation | null> {
    try {
      const result = await this.prismaService.orders.findFirst({
        where: { id: id },
        include: OrdersWithFullInformationInclude,
      });

      if (!result) {
        throw new NotFoundException('Order not found!');
      }

      const returnResult = formatMediaFieldWithLoggingForOrders(
        [result],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      if (!returnResult) {
        throw new NotFoundException('Order error after formatting media!');
      }

      this.logger.log(`Fetched order detail information with ID: ${id}`);
      return returnResult;
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
  ): Promise<OrdersWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrdersWithFullInformation,
        Prisma.OrdersFindManyArgs
      >(
        this.prismaService.orders,
        {
          include: OrdersWithFullInformationInclude,
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      result.data = formatMediaFieldWithLoggingForOrders(
        result.data,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      this.logger.log(
        `Fetched all orders with detail information - Page: ${page}, Per Page: ${perPage}`,
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
  ): Promise<OrderItemsWithVariantAndMediaInformation[] | []> {
    try {
      const result = await this.prismaService.orderItems.findMany({
        where: { orderId: id },
        include: {
          productVariant: {
            include: {
              media: true,
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundException('Order items not found!');
      }

      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        // convert product variant media field
        item.productVariant.media = formatMediaFieldWithLogging(
          item.productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'product variant',
          item.productVariant.id,
          this.logger,
        );
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
  ): Promise<ShipmentsWithFullInformation[] | []> {
    try {
      const result = await this.prismaService.shipments.findMany({
        where: { orderId: id },
        include: {
          processByStaff: {
            include: {
              userMedia: true,
            },
          },
          order: {
            include: OrdersWithFullInformationInclude,
          },
        },
      });

      if (!result) {
        throw new NotFoundException('Order shipments not found!');
      }

      const returnResult = formatMediaFieldWithLoggingForShipments(
        result,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      if (!returnResult) {
        throw new NotFoundException('Order shipments error after formatting!');
      }

      this.logger.log(`Fetched order shipments for order ID: ${id}`);
      return returnResult;
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
          processByStaff: {
            include: {
              userMedia: true,
            },
          },
          media: true,
        },
      });

      if (!result) {
        throw new NotFoundException('Order requests not found!');
      }

      // generate https url for media field
      for (let i = 0; i < result.length; i++) {
        const request = result[i];
        request.media = formatMediaFieldWithLogging(
          request.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'request',
          request.id,
          this.logger,
        );

        // generate https url for processByStaff user media field
        if (request.processByStaff) {
          request.processByStaff.userMedia = formatMediaFieldWithLogging(
            request.processByStaff.userMedia,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'user',
            request.processByStaff.id,
            this.logger,
          );
        }
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
