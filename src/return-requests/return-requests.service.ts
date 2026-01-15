import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import { UpdateReturnRequestDto } from './dto/update-return-request.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, ReturnRequests } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class ReturnRequestsService {
  private readonly logger = new Logger(ReturnRequestsService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createReturnRequestDto: CreateReturnRequestDto,
  ): Promise<ReturnRequests> {
    try {
      const result = await this.prismaService.returnRequests.create({
        data: { ...createReturnRequestDto },
      });

      this.logger.log('Return request created successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error creating return request', error);
      throw new BadRequestException('Failed to create return request');
    }
  }

  async findAll(page: number, perPage: number): Promise<ReturnRequests[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ReturnRequests,
        Prisma.ReturnRequestsFindManyArgs
      >(
        this.prismaService.returnRequests,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Fetched return requests successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error fetching return requests', error);
      throw new BadRequestException('Failed to fetch return requests');
    }
  }

  async findOne(id: number): Promise<ReturnRequests | null> {
    try {
      const result = await this.prismaService.returnRequests.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Return request not found!');
      }

      this.logger.log('Fetched return request successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error fetching return request', error);
      throw new BadRequestException('Failed to fetch return request');
    }
  }

  async update(
    id: number,
    updateReturnRequestDto: UpdateReturnRequestDto,
  ): Promise<ReturnRequests> {
    try {
      const result = await this.prismaService.returnRequests.update({
        where: { id: id },
        data: { ...updateReturnRequestDto },
      });

      this.logger.log('Return request updated successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error updating return request', error);
      throw new BadRequestException('Failed to update return request');
    }
  }

  async remove(id: number): Promise<ReturnRequests> {
    try {
      this.logger.log('Deleting return request', id);
      return await this.prismaService.returnRequests.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log('Error deleting return request', error);
      throw new BadRequestException('Failed to delete return request');
    }
  }
}
