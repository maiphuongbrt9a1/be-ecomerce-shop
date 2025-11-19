import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserVoucherDto } from './dto/create-user-voucher.dto';
import { UpdateUserVoucherDto } from './dto/update-user-voucher.dto';
import { Prisma, UserVouchers } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class UserVouchersService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(
    createUserVoucherDto: CreateUserVoucherDto,
  ): Promise<UserVouchers> {
    const result = await this.prismaService.userVouchers.create({
      data: { ...createUserVoucherDto },
    });

    return result;
  }

  async findAll(page: number, perPage: number): Promise<UserVouchers[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<
      UserVouchers,
      Prisma.UserVouchersFindManyArgs
    >(
      this.prismaService.userVouchers,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<UserVouchers | null> {
    const result = await this.prismaService.userVouchers.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new NotFoundException('User voucher not found!');
    }

    return result;
  }

  async update(
    id: number,
    updateUserVoucherDto: UpdateUserVoucherDto,
  ): Promise<UserVouchers> {
    const result = await this.prismaService.userVouchers.update({
      where: { id: id },
      data: { ...updateUserVoucherDto },
    });
    return result;
  }

  async remove(id: number): Promise<UserVouchers> {
    return await this.prismaService.userVouchers.delete({
      where: { id: id },
    });
  }
}
