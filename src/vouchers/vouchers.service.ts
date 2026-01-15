import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Vouchers } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import {
  VoucherWithAllAppliedCategoriesDetailInformation,
  VoucherWithAllAppliedProductsDetailInformation,
  VoucherWithAllAppliedProductVariantsDetailInformation,
} from '@/helpers/types/types';

@Injectable()
export class VouchersService {
  private readonly logger = new Logger(VouchersService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(createVoucherDto: CreateVoucherDto): Promise<Vouchers> {
    try {
      const result = await this.prismaService.vouchers.create({
        data: { ...createVoucherDto },
      });

      this.logger.log('Voucher created successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error creating voucher', error);
      throw new BadRequestException('Failed to create voucher');
    }
  }

  async findAll(page: number, perPage: number): Promise<Vouchers[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Vouchers, Prisma.VouchersFindManyArgs>(
        this.prismaService.vouchers,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Vouchers retrieved successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving vouchers', error);
      throw new BadRequestException('Failed to retrieve vouchers');
    }
  }

  async findOne(id: number): Promise<Vouchers | null> {
    try {
      const result = await this.prismaService.vouchers.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Voucher not found!');
      }

      this.logger.log('Voucher retrieved successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving voucher', error);
      throw new BadRequestException('Failed to retrieve voucher');
    }
  }

  async update(
    id: number,
    updateVoucherDto: UpdateVoucherDto,
  ): Promise<Vouchers> {
    try {
      const result = await this.prismaService.vouchers.update({
        where: { id: id },
        data: { ...updateVoucherDto },
      });

      this.logger.log('Voucher updated successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error updating voucher', error);
      throw new BadRequestException('Failed to update voucher');
    }
  }

  async remove(id: number): Promise<Vouchers> {
    try {
      this.logger.log('Voucher deleted successfully', id);
      return await this.prismaService.vouchers.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log('Error deleting voucher', error);
      throw new BadRequestException('Failed to delete voucher');
    }
  }

  async getAllCategoriesAreAppliedThisVoucher(
    id: number,
    page: number,
    perPage: number,
  ): Promise<VoucherWithAllAppliedCategoriesDetailInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        VoucherWithAllAppliedCategoriesDetailInformation,
        Prisma.VouchersFindManyArgs
      >(
        this.prismaService.vouchers,
        {
          where: { id: id },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      this.logger.log(
        'Categories applied to voucher retrieved successfully',
        id,
      );
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving categories applied to voucher', error);
      throw new BadRequestException(
        'Failed to retrieve categories applied to voucher',
      );
    }
  }

  async getAllProductsAreAppliedThisVoucher(
    id: number,
    page: number,
    perPage: number,
  ): Promise<VoucherWithAllAppliedProductsDetailInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        VoucherWithAllAppliedProductsDetailInformation,
        Prisma.VouchersFindManyArgs
      >(
        this.prismaService.vouchers,
        {
          where: { id: id },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      this.logger.log('Products applied to voucher retrieved successfully', id);
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving products applied to voucher', error);
      throw new BadRequestException(
        'Failed to retrieve products applied to voucher',
      );
    }
  }

  async getAllProductVariantsAreAppliedThisVoucher(
    id: number,
    page: number,
    perPage: number,
  ): Promise<VoucherWithAllAppliedProductVariantsDetailInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        VoucherWithAllAppliedProductVariantsDetailInformation,
        Prisma.VouchersFindManyArgs
      >(
        this.prismaService.vouchers,
        {
          where: { id: id },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      this.logger.log(
        'Product variants applied to voucher retrieved successfully',
        id,
      );
      return result.data;
    } catch (error) {
      this.logger.log(
        'Error retrieving product variants applied to voucher',
        error,
      );
      throw new BadRequestException(
        'Failed to retrieve product variants applied to voucher',
      );
    }
  }
}
