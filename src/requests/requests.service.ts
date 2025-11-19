import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Requests } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class RequestsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createRequestDto: CreateRequestDto): Promise<Requests> {
    const result = await this.prismaService.requests.create({
      data: { ...createRequestDto },
    });

    return result;
  }

  async findAll(page: number, perPage: number): Promise<Requests[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Requests, Prisma.RequestsFindManyArgs>(
      this.prismaService.requests,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<Requests | null> {
    const result = await this.prismaService.requests.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new NotFoundException('Request not found!');
    }

    return result;
  }

  async update(
    id: number,
    updateRequestDto: UpdateRequestDto,
  ): Promise<Requests> {
    const result = await this.prismaService.requests.update({
      where: { id: id },
      data: { ...updateRequestDto },
    });
    return result;
  }

  async remove(id: number): Promise<Requests> {
    return await this.prismaService.requests.delete({
      where: { id: id },
    });
  }
}
