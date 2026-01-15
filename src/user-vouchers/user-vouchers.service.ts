import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserVoucherDto } from './dto/create-user-voucher.dto';
import { UpdateUserVoucherDto } from './dto/update-user-voucher.dto';
import { Prisma, UserVouchers } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class UserVouchersService {
  private readonly logger = new Logger(UserVouchersService.name);
  constructor(private readonly prismaService: PrismaService) {}
  async create(
    createUserVoucherDto: CreateUserVoucherDto,
  ): Promise<UserVouchers> {
    try {
      const result = await this.prismaService.userVouchers.create({
        data: { ...createUserVoucherDto },
      });

      this.logger.log('User voucher created successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error creating user voucher', error);
      throw new BadRequestException('Failed to create user voucher');
    }
  }

  async findAll(page: number, perPage: number): Promise<UserVouchers[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        UserVouchers,
        Prisma.UserVouchersFindManyArgs
      >(
        this.prismaService.userVouchers,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('User vouchers retrieved successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving user vouchers', error);
      throw new BadRequestException('Failed to retrieve user vouchers');
    }
  }

  async findOne(id: number): Promise<UserVouchers | null> {
    try {
      const result = await this.prismaService.userVouchers.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('User voucher not found!');
      }

      this.logger.log('User voucher retrieved successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving user voucher', error);
      throw new BadRequestException('Failed to retrieve user voucher');
    }
  }

  async update(
    id: number,
    updateUserVoucherDto: UpdateUserVoucherDto,
  ): Promise<UserVouchers> {
    try {
      const result = await this.prismaService.userVouchers.update({
        where: { id: id },
        data: { ...updateUserVoucherDto },
      });

      this.logger.log('User voucher updated successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error updating user voucher', error);
      throw new BadRequestException('Failed to update user voucher');
    }
  }

  async remove(id: number): Promise<UserVouchers> {
    try {
      this.logger.log('User voucher deleted successfully', id);

      return await this.prismaService.userVouchers.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log('Error deleting user voucher', error);
      throw new BadRequestException('Failed to delete user voucher');
    }
  }
}
