import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateSizeProfileDto } from './dto/create-size-profile.dto';
import { UpdateSizeProfileDto } from './dto/update-size-profile.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, SizeProfiles } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class SizeProfilesService {
  private readonly logger = new Logger(SizeProfilesService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createSizeProfileDto: CreateSizeProfileDto,
  ): Promise<SizeProfiles> {
    try {
      const result = await this.prismaService.sizeProfiles.create({
        data: { ...createSizeProfileDto },
      });

      this.logger.log('Size profile created successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error creating size profile', error);
      throw new BadRequestException('Failed to create size profile');
    }
  }

  async findAll(page: number, perPage: number): Promise<SizeProfiles[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        SizeProfiles,
        Prisma.SizeProfilesFindManyArgs
      >(
        this.prismaService.sizeProfiles,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Size profiles retrieved successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving size profiles', error);
      throw new BadRequestException('Failed to retrieve size profiles');
    }
  }

  async findOne(id: number): Promise<SizeProfiles | null> {
    try {
      const result = await this.prismaService.sizeProfiles.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Size profile not found!');
      }

      this.logger.log('Size profile retrieved successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving size profile', error);
      throw new BadRequestException('Failed to retrieve size profile');
    }
  }

  async update(
    id: number,
    updateSizeProfileDto: UpdateSizeProfileDto,
  ): Promise<SizeProfiles> {
    try {
      const result = await this.prismaService.sizeProfiles.update({
        where: { id: id },
        data: { ...updateSizeProfileDto },
      });

      this.logger.log('Size profile updated successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error updating size profile', error);
      throw new BadRequestException('Failed to update size profile');
    }
  }

  async remove(id: number): Promise<SizeProfiles> {
    try {
      this.logger.log('Size profile deleted: ', id);
      return await this.prismaService.sizeProfiles.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log('Error deleting size profile', error);
      throw new BadRequestException('Failed to delete size profile');
    }
  }
}
