import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Color, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class ColorService {
  private readonly logger = new Logger(ColorService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(createColorDto: CreateColorDto): Promise<Color> {
    try {
      const result = await this.prismaService.color.create({
        data: { ...createColorDto },
      });

      if (!result) {
        throw new NotFoundException('Failed to create color');
      }

      this.logger.log(`Color created with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to create color: ', error);
      throw new BadRequestException('Failed to create color');
    }
  }

  async findAll(page: number, perPage: number): Promise<Color[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Color, Prisma.ColorFindManyArgs>(
        this.prismaService.color,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Fetched all colors - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all colors: ', error);
      throw new BadRequestException('Failed to fetch all colors');
    }
  }

  async findOne(id: number): Promise<Color | null> {
    try {
      const result = await this.prismaService.color.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Color not found!');
      }

      this.logger.log(`Fetched color with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch color with ID ${id}: `, error);
      throw new BadRequestException('Failed to fetch color');
    }
  }

  async update(id: number, updateColorDto: UpdateColorDto): Promise<Color> {
    try {
      const result = await this.prismaService.color.update({
        where: { id: id },
        data: { ...updateColorDto },
      });

      this.logger.log(`Updated color with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update color with ID ${id}: `, error);
      throw new BadRequestException('Failed to update color');
    }
  }

  async remove(id: number): Promise<Color> {
    try {
      this.logger.log(`Removing color with ID: ${id}`);
      return await this.prismaService.color.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error(`Failed to remove color with ID ${id}: `, error);
      throw new BadRequestException('Failed to remove color');
    }
  }
}
