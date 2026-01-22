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
import { RequestsWithMedia } from '@/helpers/types/types';
import { formatMediaFieldWithLogging } from '@/helpers/utils';

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
  ): Promise<RequestsWithMedia> {
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

      const returnResult = await this.prismaService.requests.findUnique({
        include: {
          media: true,
          processByStaff: {
            include: {
              userMedia: true,
            },
          },
        },
        where: { id: result.id },
      });

      if (!returnResult) {
        throw new NotFoundException('Failed to fetch created request');
      }

      // generate https link for media field
      if (returnResult.media && returnResult.media.length > 0) {
        returnResult.media = formatMediaFieldWithLogging(
          returnResult.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'request',
          returnResult.id,
          this.logger,
        );
      }

      if (
        returnResult.processByStaff &&
        returnResult.processByStaff.userMedia &&
        returnResult.processByStaff.userMedia.length > 0
      ) {
        returnResult.processByStaff.userMedia = formatMediaFieldWithLogging(
          returnResult.processByStaff.userMedia,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'user',
          returnResult.processByStaff.id,
          this.logger,
        );
      }

      this.logger.log('Request created successfully', returnResult.id);
      return returnResult;
    } catch (error) {
      this.logger.log('Error creating request', error);
      throw new BadRequestException('Error creating request');
    }
  }

  async findAll(
    page: number,
    perPage: number,
  ): Promise<RequestsWithMedia[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        RequestsWithMedia,
        Prisma.RequestsFindManyArgs
      >(
        this.prismaService.requests,
        {
          include: {
            media: true,
            processByStaff: {
              include: {
                userMedia: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate https link for media field
      for (let i = 0; i < result.data.length; i++) {
        const request = result.data[i];

        if (request.media && request.media.length > 0) {
          request.media = formatMediaFieldWithLogging(
            request.media,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'request',
            request.id,
            this.logger,
          );
        }

        if (
          request.processByStaff &&
          request.processByStaff.userMedia &&
          request.processByStaff.userMedia.length > 0
        ) {
          request.processByStaff.userMedia = formatMediaFieldWithLogging(
            request.processByStaff.userMedia,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'user',
            request.processByStaff.id,
            this.logger,
          );
        }
      }

      this.logger.log(
        `Fetched ${perPage} requests on page ${page} successfully`,
      );
      return result.data;
    } catch (error) {
      this.logger.log('Error fetching all requests', error);
      throw new BadRequestException('Error fetching all requests');
    }
  }

  async findOne(id: number): Promise<RequestsWithMedia | null> {
    try {
      const result = await this.prismaService.requests.findFirst({
        where: { id: id },
        include: {
          media: true,
          processByStaff: {
            include: {
              userMedia: true,
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundException('Request not found!');
      }

      // generate https link for media field
      if (result.media && result.media.length > 0) {
        result.media = formatMediaFieldWithLogging(
          result.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'request',
          result.id,
          this.logger,
        );
      }

      if (
        result.processByStaff &&
        result.processByStaff.userMedia &&
        result.processByStaff.userMedia.length > 0
      ) {
        result.processByStaff.userMedia = formatMediaFieldWithLogging(
          result.processByStaff.userMedia,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'user',
          result.processByStaff.id,
          this.logger,
        );
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
    files: Express.Multer.File[],
    userId: string,
  ): Promise<RequestsWithMedia> {
    try {
      // Find old review with media files and prepare to delete selected media files
      const oldRequest = await this.prismaService.requests.findUnique({
        include: { media: true },
        where: { id: id },
      });
      const oldMediaFiles = oldRequest?.media;
      // dto have media ids to delete if you want to delete some media files and upload new files
      const { mediaIdsToDelete, ...updateData } = updateRequestDto;

      const result = await this.prismaService.requests.update({
        where: { id: id },
        data: { ...updateData },
      });

      if (!result) {
        throw new NotFoundException('Failed to update request');
      }

      // update media files if have new uploaded files
      if (files && files.length > 0) {
        const mediaUploadForRequest =
          await this.awsService.uploadManyRequestFile(
            files,
            userId,
            id.toString(),
          );

        if (!mediaUploadForRequest) {
          throw new NotFoundException('Failed to upload request media files');
        }
      }

      // Delete media files from s3 and database if update product variant and media files successfully
      if (mediaIdsToDelete && mediaIdsToDelete.length > 0) {
        const mediaFilesToDelete = oldMediaFiles?.filter((media) =>
          mediaIdsToDelete.includes(media.id),
        );

        if (mediaFilesToDelete && mediaFilesToDelete.length > 0) {
          for (const media of mediaFilesToDelete) {
            await this.awsService.deleteFileFromS3(media.url);
          }

          await this.prismaService.media.deleteMany({
            where: { id: { in: mediaIdsToDelete } },
          });
        }
      }

      // generate full http url for media files
      const resultRequest = await this.prismaService.requests.findUnique({
        include: {
          media: true,
          processByStaff: {
            include: {
              userMedia: true,
            },
          },
        },
        where: { id: result.id },
      });

      if (!resultRequest) {
        throw new NotFoundException('Failed to retrieve updated request');
      }

      resultRequest.media = formatMediaFieldWithLogging(
        resultRequest.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'request',
        resultRequest.id,
        this.logger,
      );

      this.logger.log('Request updated successfully', id);
      return resultRequest;
    } catch (error) {
      this.logger.log('Error updating request', error);
      throw new BadRequestException('Error updating request');
    }
  }

  async remove(id: number): Promise<Requests> {
    try {
      this.logger.log('Deleting request', id);
      // get request to delete associated media files from s3
      const requestToDelete = await this.prismaService.requests.findUnique({
        include: { media: true },
        where: { id: id },
      });

      // delete request record from database
      const result = await this.prismaService.requests.delete({
        where: { id: id },
      });

      // delete associated media files from s3
      if (requestToDelete && requestToDelete.media.length > 0) {
        for (const media of requestToDelete.media) {
          await this.awsService.deleteFileFromS3(media.url);
        }
      }

      this.logger.log('Request deleted successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error deleting request', error);
      throw new BadRequestException('Error deleting request');
    }
  }
}
