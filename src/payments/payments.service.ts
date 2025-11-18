import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Payments, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class PaymentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payments> {
    const result = await this.prismaService.payments.create({
      data: { ...createPaymentDto },
    });

    return result;
  }

  async findAll(page: number, perPage: number): Promise<Payments[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Payments, Prisma.PaymentsFindManyArgs>(
      this.prismaService.payments,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<Payments | null> {
    const result = await this.prismaService.payments.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new NotFoundException('Payments not found!');
    }

    return result;
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payments> {
    const result = await this.prismaService.payments.update({
      where: { id: id },
      data: { ...updatePaymentDto },
    });
    return result;
  }

  async remove(id: number): Promise<Payments> {
    return await this.prismaService.payments.delete({
      where: { id: id },
    });
  }
}
