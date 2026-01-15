import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Media, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(createMediaDto: CreateMediaDto): Promise<Media> {
    try {
      const mediaFile = await this.prismaService.media.create({
        data: { ...createMediaDto },
      });

      this.logger.log(`Media file created with ID: ${mediaFile.id}`);
      return mediaFile;
    } catch (error) {
      this.logger.error('Failed to create media file: ', error);
      throw new BadRequestException('Failed to create media file');
    }
  }

  async findAll(page: number, perPage: number): Promise<Media[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Media, Prisma.MediaFindManyArgs>(
        this.prismaService.media,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Fetched all media files - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all media files: ', error);
      throw new BadRequestException('Failed to fetch all media files');
    }
  }

  async findOne(id: number): Promise<Media | null> {
    try {
      const mediaFile = await this.prismaService.media.findFirst({
        where: { id: id },
      });

      if (!mediaFile) {
        throw new NotFoundException('Media file not found!');
      }

      this.logger.log(`Fetched media file with ID: ${id}`);
      return mediaFile;
    } catch (error) {
      this.logger.error(`Failed to fetch media file with ID ${id}: `, error);
      throw new BadRequestException('Failed to fetch media file');
    }
  }

  async update(id: number, updateMediaDto: UpdateMediaDto): Promise<Media> {
    try {
      const mediaFile = await this.prismaService.media.update({
        where: { id: id },
        data: { ...updateMediaDto },
      });

      this.logger.log(`Updated media file with ID: ${id}`);
      return mediaFile;
    } catch (error) {
      this.logger.error(`Failed to update media file with ID ${id}: `, error);
      throw new BadRequestException('Failed to update media file');
    }
  }

  async remove(id: number): Promise<Media> {
    try {
      this.logger.log(`Removing media file with ID: ${id}`);
      return await this.prismaService.media.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error(`Failed to remove media file with ID ${id}: `, error);
      throw new BadRequestException('Failed to remove media file');
    }
  }
}
