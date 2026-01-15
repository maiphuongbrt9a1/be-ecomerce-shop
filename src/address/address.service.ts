import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Address, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    try {
      const address = await this.prismaService.address.create({
        data: { ...createAddressDto },
      });

      this.logger.log(`Address created with ID: ${address.id}`);
      return address;
    } catch (error) {
      this.logger.error('Failed to create address: ', error);
      throw new BadRequestException('Failed to create address');
    }
  }

  async findAll(page: number, perPage: number): Promise<Address[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Address, Prisma.AddressFindManyArgs>(
        this.prismaService.address,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Fetched all addresses - Page: ${page}, Per Page: ${perPage}`,
      );

      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all addresses: ', error);
      throw new BadRequestException('Failed to fetch all addresses');
    }
  }

  async findOne(id: number): Promise<Address | null> {
    try {
      const address = await this.prismaService.address.findFirst({
        where: { id: id },
      });

      if (!address) {
        throw new NotFoundException('Address not found!');
      }

      this.logger.log(`Fetched address with ID: ${id}`);
      return address;
    } catch (error) {
      this.logger.error(`Failed to fetch address with ID ${id}: `, error);
      throw new BadRequestException('Failed to fetch address');
    }
  }

  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    try {
      const address = await this.prismaService.address.update({
        where: { id: id },
        data: { ...updateAddressDto },
      });

      this.logger.log(`Updated address with ID: ${id}`);
      return address;
    } catch (error) {
      this.logger.error(`Failed to update address with ID ${id}: `, error);
      throw new BadRequestException('Failed to update address');
    }
  }

  async remove(id: number): Promise<Address> {
    try {
      const address = await this.prismaService.address.delete({
        where: { id: id },
      });

      this.logger.log(`Deleted address with ID: ${id}`);
      return address;
    } catch (error) {
      this.logger.error(`Failed to delete address with ID ${id}: `, error);
      throw new BadRequestException('Failed to delete address');
    }
  }
}
