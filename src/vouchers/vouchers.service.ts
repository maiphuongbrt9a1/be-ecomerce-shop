import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Vouchers } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class VouchersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createVoucherDto: CreateVoucherDto): Promise<Vouchers> {
    const result = await this.prismaService.vouchers.create({
      data: { ...createVoucherDto },
    });

    return result;
  }

  async findAll(page: number, perPage: number): Promise<Vouchers[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Vouchers, Prisma.VouchersFindManyArgs>(
      this.prismaService.vouchers,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<Vouchers | null> {
    const result = await this.prismaService.vouchers.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new NotFoundException('Voucher not found!');
    }

    return result;
  }

  async update(
    id: number,
    updateVoucherDto: UpdateVoucherDto,
  ): Promise<Vouchers> {
    const result = await this.prismaService.vouchers.update({
      where: { id: id },
      data: { ...updateVoucherDto },
    });
    return result;
  }

  async remove(id: number): Promise<Vouchers> {
    return await this.prismaService.vouchers.delete({
      where: { id: id },
    });
  }
}
