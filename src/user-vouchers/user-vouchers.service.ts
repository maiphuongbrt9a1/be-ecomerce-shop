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
import { UserVoucherDetailInformation } from '@/helpers/types/types';

@Injectable()
export class UserVouchersService {
  private readonly logger = new Logger(UserVouchersService.name);
  constructor(private readonly prismaService: PrismaService) {}
  async create(
    createUserVoucherDto: CreateUserVoucherDto,
  ): Promise<UserVoucherDetailInformation> {
    try {
      const result = await this.prismaService.userVouchers.create({
        data: { ...createUserVoucherDto },
      });

      if (!result) {
        throw new BadRequestException('User voucher creation failed!');
      }

      const returnResult = await this.prismaService.userVouchers.findUnique({
        where: { id: result.id },
        include: {
          voucher: true,
        },
      });

      if (!returnResult) {
        throw new NotFoundException('Created user voucher not found!');
      }

      this.logger.log('User voucher created successfully', returnResult.id);
      return returnResult;
    } catch (error) {
      this.logger.log('Error creating user voucher', error);
      throw new BadRequestException('Failed to create user voucher');
    }
  }

  async findAll(
    page: number,
    perPage: number,
  ): Promise<UserVoucherDetailInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        UserVoucherDetailInformation,
        Prisma.UserVouchersFindManyArgs
      >(
        this.prismaService.userVouchers,
        {
          include: {
            voucher: true,
          },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      this.logger.log('User vouchers retrieved successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving user vouchers', error);
      throw new BadRequestException('Failed to retrieve user vouchers');
    }
  }

  async findOne(id: number): Promise<UserVoucherDetailInformation | null> {
    try {
      const result = await this.prismaService.userVouchers.findFirst({
        include: {
          voucher: true,
        },
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
  ): Promise<UserVoucherDetailInformation> {
    try {
      const result = await this.prismaService.userVouchers.update({
        where: { id: id },
        data: { ...updateUserVoucherDto },
      });

      if (!result) {
        throw new BadRequestException('User voucher update failed!');
      }

      const returnResult = await this.prismaService.userVouchers.findUnique({
        where: { id: result.id },
        include: {
          voucher: true,
        },
      });

      if (!returnResult) {
        throw new NotFoundException('Updated user voucher not found!');
      }

      this.logger.log('User voucher updated successfully', id);
      return returnResult;
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
