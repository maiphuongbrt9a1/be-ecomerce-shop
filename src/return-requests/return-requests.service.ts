import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import { UpdateReturnRequestDto } from './dto/update-return-request.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, ReturnRequests } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class ReturnRequestsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createReturnRequestDto: CreateReturnRequestDto,
  ): Promise<ReturnRequests> {
    const result = await this.prismaService.returnRequests.create({
      data: { ...createReturnRequestDto },
    });

    return result;
  }

  async findAll(page: number, perPage: number): Promise<ReturnRequests[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<
      ReturnRequests,
      Prisma.ReturnRequestsFindManyArgs
    >(
      this.prismaService.returnRequests,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<ReturnRequests | null> {
    const result = await this.prismaService.returnRequests.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new NotFoundException('Return request not found!');
    }

    return result;
  }

  async update(
    id: number,
    updateReturnRequestDto: UpdateReturnRequestDto,
  ): Promise<ReturnRequests> {
    const result = await this.prismaService.returnRequests.update({
      where: { id: id },
      data: { ...updateReturnRequestDto },
    });
    return result;
  }

  async remove(id: number): Promise<ReturnRequests> {
    return await this.prismaService.returnRequests.delete({
      where: { id: id },
    });
  }
}
