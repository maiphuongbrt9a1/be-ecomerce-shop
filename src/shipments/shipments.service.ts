import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Shipments } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class ShipmentsService {
  private readonly logger = new Logger(ShipmentsService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(createShipmentDto: CreateShipmentDto): Promise<Shipments> {
    try {
      const result = await this.prismaService.shipments.create({
        data: { ...createShipmentDto },
      });
      this.logger.log('Shipment created successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error creating shipment', error);
      throw new BadRequestException('Failed to create shipment');
    }
  }

  async findAll(page: number, perPage: number): Promise<Shipments[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Shipments, Prisma.ShipmentsFindManyArgs>(
        this.prismaService.shipments,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Fetched shipments successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error fetching shipments', error);
      throw new BadRequestException('Failed to fetch shipments');
    }
  }

  async findOne(id: number): Promise<Shipments | null> {
    try {
      const result = await this.prismaService.shipments.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Shipments not found!');
      }
      this.logger.log('Fetched shipment successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error fetching shipment', error);
      throw new BadRequestException('Failed to fetch shipment');
    }
  }

  async update(
    id: number,
    updateShipmentDto: UpdateShipmentDto,
  ): Promise<Shipments> {
    try {
      const result = await this.prismaService.shipments.update({
        where: { id: id },
        data: { ...updateShipmentDto },
      });
      this.logger.log('Shipment updated successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error updating shipment', error);
      throw new BadRequestException('Failed to update shipment');
    }
  }

  async remove(id: number): Promise<Shipments> {
    try {
      this.logger.log('Deleting shipment', id);
      return await this.prismaService.shipments.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log('Error deleting shipment', error);
      throw new BadRequestException('Failed to delete shipment');
    }
  }
}
