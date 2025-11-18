import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSizeProfileDto } from './dto/create-size-profile.dto';
import { UpdateSizeProfileDto } from './dto/update-size-profile.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, SizeProfiles } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class SizeProfilesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createSizeProfileDto: CreateSizeProfileDto,
  ): Promise<SizeProfiles> {
    const result = await this.prismaService.sizeProfiles.create({
      data: { ...createSizeProfileDto },
    });

    return result;
  }

  async findAll(page: number, perPage: number): Promise<SizeProfiles[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<
      SizeProfiles,
      Prisma.SizeProfilesFindManyArgs
    >(
      this.prismaService.sizeProfiles,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<SizeProfiles | null> {
    const result = await this.prismaService.sizeProfiles.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new NotFoundException('Size profile not found!');
    }

    return result;
  }

  async update(
    id: number,
    updateSizeProfileDto: UpdateSizeProfileDto,
  ): Promise<SizeProfiles> {
    const result = await this.prismaService.sizeProfiles.update({
      where: { id: id },
      data: { ...updateSizeProfileDto },
    });
    return result;
  }

  async remove(id: number): Promise<SizeProfiles> {
    return await this.prismaService.sizeProfiles.delete({
      where: { id: id },
    });
  }
}
