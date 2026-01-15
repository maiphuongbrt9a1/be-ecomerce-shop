import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Media, Prisma, Reviews } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  async create(
    files: Express.Multer.File[],
    createReviewDto: CreateReviewDto,
    userId: string,
  ): Promise<Reviews> {
    try {
      const result = await this.prismaService.reviews.create({
        data: { ...createReviewDto },
      });

      if (!result) {
        throw new NotFoundException('Failed to create review');
      }

      const mediaForReview = await this.awsService.uploadManyReviewFile(
        files,
        userId,
        result.id.toString(),
      );

      if (!mediaForReview) {
        throw new NotFoundException('Failed to upload review media file');
      }

      this.logger.log('Review created successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error creating review', error);
      throw new BadRequestException('Failed to create review');
    }
  }

  async findAll(page: number, perPage: number): Promise<Reviews[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Reviews, Prisma.ReviewsFindManyArgs>(
        this.prismaService.reviews,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Fetched reviews successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error fetching reviews', error);
      throw new BadRequestException('Failed to fetch reviews');
    }
  }

  async findOne(id: number): Promise<Reviews | null> {
    try {
      const result = await this.prismaService.reviews.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Review not found!');
      }

      return result;
    } catch (error) {
      this.logger.log('Error fetching review', error);
      throw new BadRequestException('Failed to fetch review');
    }
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Reviews> {
    try {
      const result = await this.prismaService.reviews.update({
        where: { id: id },
        data: { ...updateReviewDto },
      });
      return result;
    } catch (error) {
      this.logger.log('Error updating review', error);
      throw new BadRequestException('Failed to update review');
    }
  }

  async remove(id: number): Promise<Reviews> {
    try {
      this.logger.log('Deleting review', id);
      return await this.prismaService.reviews.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log('Error deleting review', error);
      throw new BadRequestException('Failed to delete review');
    }
  }

  async getAllMediaOfReview(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Media[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Media, Prisma.MediaFindManyArgs>(
        this.prismaService.media,
        { where: { reviewId: id }, orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Fetched media of review successfully', id);
      return result.data;
    } catch (error) {
      this.logger.log('Error fetching media of review', error);
      throw new BadRequestException('Failed to fetch media of review');
    }
  }
}
