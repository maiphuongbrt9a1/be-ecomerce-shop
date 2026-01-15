import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Requests } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  async create(
    files: Express.Multer.File[],
    createRequestDto: CreateRequestDto,
    userId: string,
  ): Promise<Requests> {
    try {
      const result = await this.prismaService.requests.create({
        data: { ...createRequestDto },
      });

      if (!result) {
        throw new NotFoundException('Failed to create request');
      }

      const mediaForRequest = await this.awsService.uploadManyRequestFile(
        files,
        userId,
        result.id.toString(),
      );

      if (!mediaForRequest) {
        throw new NotFoundException('Failed to upload request media file');
      }

      this.logger.log('Request created successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error creating request', error);
      throw new BadRequestException('Error creating request');
    }
  }

  async findAll(page: number, perPage: number): Promise<Requests[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Requests, Prisma.RequestsFindManyArgs>(
        this.prismaService.requests,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Fetched ${perPage} requests on page ${page} successfully`,
      );
      return result.data;
    } catch (error) {
      this.logger.log('Error fetching all requests', error);
      throw new BadRequestException('Error fetching all requests');
    }
  }

  async findOne(id: number): Promise<Requests | null> {
    try {
      const result = await this.prismaService.requests.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Request not found!');
      }

      this.logger.log('Fetched request successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error fetching request', error);
      throw new BadRequestException('Error fetching request');
    }
  }

  async update(
    id: number,
    updateRequestDto: UpdateRequestDto,
  ): Promise<Requests> {
    try {
      const result = await this.prismaService.requests.update({
        where: { id: id },
        data: { ...updateRequestDto },
      });

      this.logger.log('Request updated successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error updating request', error);
      throw new BadRequestException('Error updating request');
    }
  }

  async remove(id: number): Promise<Requests> {
    try {
      this.logger.log('Deleting request', id);
      return await this.prismaService.requests.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log('Error deleting request', error);
      throw new BadRequestException('Error deleting request');
    }
  }
}
