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
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import {
  OrdersWithFullInformationInclude,
  ShipmentsWithFullInformation,
} from '@/helpers/types/types';
import { formatMediaFieldWithLoggingForShipments } from '@/helpers/utils';

@Injectable()
export class ShipmentsService {
  private readonly logger = new Logger(ShipmentsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  async create(
    createShipmentDto: CreateShipmentDto,
  ): Promise<ShipmentsWithFullInformation> {
    try {
      const result = await this.prismaService.shipments.create({
        data: { ...createShipmentDto },
      });

      if (!result) {
        throw new BadRequestException('Shipment creation failed');
      }

      let returnResult = await this.prismaService.shipments.findUnique({
        include: {
          processByStaff: {
            include: {
              userMedia: true,
            },
          },
          order: {
            include: OrdersWithFullInformationInclude,
          },
        },
        where: { id: result.id },
      });

      if (!returnResult) {
        throw new BadRequestException(
          'Shipment retrieval failed after creation',
        );
      }

      // generate public url for media fields in shipment
      returnResult = formatMediaFieldWithLoggingForShipments(
        [returnResult],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      this.logger.log('Shipment created successfully', result.id);
      return returnResult;
    } catch (error) {
      this.logger.log('Error creating shipment', error);
      throw new BadRequestException('Failed to create shipment');
    }
  }

  async findAll(
    page: number,
    perPage: number,
  ): Promise<ShipmentsWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ShipmentsWithFullInformation,
        Prisma.ShipmentsFindManyArgs
      >(
        this.prismaService.shipments,
        {
          include: {
            processByStaff: {
              include: {
                userMedia: true,
              },
            },
            order: {
              include: OrdersWithFullInformationInclude,
            },
          },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate public url for media fields in shipments
      result.data = formatMediaFieldWithLoggingForShipments(
        result.data,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      this.logger.log('Fetched shipments successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error fetching shipments', error);
      throw new BadRequestException('Failed to fetch shipments');
    }
  }

  async findOne(id: number): Promise<ShipmentsWithFullInformation | null> {
    try {
      let result = await this.prismaService.shipments.findFirst({
        include: {
          processByStaff: {
            include: {
              userMedia: true,
            },
          },
          order: {
            include: OrdersWithFullInformationInclude,
          },
        },
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Shipments not found!');
      }

      // generate public url for media fields in shipment
      result = formatMediaFieldWithLoggingForShipments(
        [result],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

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
  ): Promise<ShipmentsWithFullInformation> {
    try {
      const result = await this.prismaService.shipments.update({
        where: { id: id },
        data: { ...updateShipmentDto },
      });

      if (!result) {
        throw new BadRequestException('Shipment update failed');
      }

      let returnResult = await this.prismaService.shipments.findUnique({
        include: {
          processByStaff: {
            include: {
              userMedia: true,
            },
          },
          order: {
            include: OrdersWithFullInformationInclude,
          },
        },
        where: { id: result.id },
      });

      if (!returnResult) {
        throw new BadRequestException('Shipment retrieval failed after update');
      }
      // generate public url for media fields in shipment
      returnResult = formatMediaFieldWithLoggingForShipments(
        [returnResult],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      this.logger.log('Shipment updated successfully', returnResult.id);
      return returnResult;
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
