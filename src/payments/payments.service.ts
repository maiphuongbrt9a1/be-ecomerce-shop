import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Payments,
  PaymentStatus,
  Prisma,
  ShipmentStatus,
} from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import dayjs from 'dayjs';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payments> {
    try {
      const result = await this.prismaService.payments.create({
        data: { ...createPaymentDto },
      });

      this.logger.log(`Payment created with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.log('Failed to create payment: ', error);
      throw new BadRequestException('Failed to create payment');
    }
  }

  async findAll(page: number, perPage: number): Promise<Payments[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Payments, Prisma.PaymentsFindManyArgs>(
        this.prismaService.payments,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Fetched all payments - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all payments: ', error);
      throw new BadRequestException('Failed to fetch all payments');
    }
  }

  async findOne(id: number): Promise<Payments | null> {
    try {
      const result = await this.prismaService.payments.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Payments not found!');
      }

      this.logger.log(`Fetched payment with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch payment: ', error);
      throw new BadRequestException('Failed to fetch payment');
    }
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
    shipmentCarrier: string,
  ): Promise<Payments> {
    try {
      const oldPayment = await this.prismaService.payments.findUnique({
        where: { id: id },
        include: {
          order: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!oldPayment) {
        throw new NotFoundException('Payment not found!');
      }

      const result = await this.prismaService.payments.update({
        where: { id: id },
        data: { ...updatePaymentDto },
      });

      if (
        result &&
        result.status === PaymentStatus.PAID &&
        oldPayment.status === PaymentStatus.PENDING
      ) {
        await this.prismaService.shipments.create({
          data: {
            orderId: result.orderId,
            processByStaffId: null,
            estimatedDelivery: dayjs().add(1, 'days').toDate(),
            estimatedShipDate: dayjs().add(2, 'days').toDate(),
            carrier: shipmentCarrier,
            trackingNumber: `${Date.now()}-${result.orderId}-${oldPayment.order.userId}-${Math.floor(
              Math.random() * 10000000,
            )}`,
            status: ShipmentStatus.WAITING_FOR_PICKUP,
          },
        });
      }

      this.logger.log(`Updated payment with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to update payment: ', error);
      throw new BadRequestException('Failed to update payment');
    }
  }

  async remove(id: number): Promise<Payments> {
    try {
      this.logger.log(`Removing payment with ID: ${id}`);
      return await this.prismaService.payments.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error('Failed to remove payment: ', error);
      throw new BadRequestException('Failed to remove payment');
    }
  }
}
