import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Address, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class AddressService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const address = await this.prismaService.address.create({
      data: { ...createAddressDto },
    });

    return address;
  }

  async findAll(page: number, perPage: number): Promise<Address[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Address, Prisma.AddressFindManyArgs>(
      this.prismaService.address,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<Address | null> {
    const address = await this.prismaService.address.findFirst({
      where: { id: id },
    });

    if (!address) {
      throw new NotFoundException('Address not found!');
    }

    return address;
  }

  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.prismaService.address.update({
      where: { id: id },
      data: { ...updateAddressDto },
    });

    return address;
  }

  async remove(id: number): Promise<Address> {
    const address = await this.prismaService.address.delete({
      where: { id: id },
    });

    return address;
  }
}
