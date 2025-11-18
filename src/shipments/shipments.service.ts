import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Shipments } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class ShipmentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createShipmentDto: CreateShipmentDto): Promise<Shipments> {
    const result = await this.prismaService.shipments.create({
      data: { ...createShipmentDto },
    });

    return result;
  }

  async findAll(page: number, perPage: number): Promise<Shipments[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Shipments, Prisma.ShipmentsFindManyArgs>(
      this.prismaService.shipments,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<Shipments | null> {
    const result = await this.prismaService.shipments.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new NotFoundException('Shipments not found!');
    }

    return result;
  }

  async update(
    id: number,
    updateShipmentDto: UpdateShipmentDto,
  ): Promise<Shipments> {
    const result = await this.prismaService.shipments.update({
      where: { id: id },
      data: { ...updateShipmentDto },
    });
    return result;
  }

  async remove(id: number): Promise<Shipments> {
    return await this.prismaService.shipments.delete({
      where: { id: id },
    });
  }
}
