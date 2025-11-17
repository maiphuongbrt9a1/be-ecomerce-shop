import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Media, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class MediaService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createMediaDto: CreateMediaDto): Promise<Media> {
    const mediaFile = await this.prismaService.media.create({
      data: { ...createMediaDto },
    });
    return mediaFile;
  }

  async findAll(page: number, perPage: number): Promise<Media[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Media, Prisma.MediaFindManyArgs>(
      this.prismaService.media,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<Media | null> {
    const mediaFile = await this.prismaService.media.findFirst({
      where: { id: id },
    });

    if (!mediaFile) {
      throw new NotFoundException('Media file not found!');
    }

    return mediaFile;
  }

  async update(id: number, updateMediaDto: UpdateMediaDto): Promise<Media> {
    const mediaFile = await this.prismaService.media.update({
      where: { id: id },
      data: { ...updateMediaDto },
    });

    return mediaFile;
  }

  async remove(id: number): Promise<Media> {
    return await this.prismaService.media.delete({
      where: { id: id },
    });
  }
}
