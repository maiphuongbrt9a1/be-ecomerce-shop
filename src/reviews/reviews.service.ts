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
import { ReviewsWithMedia } from '@/helpers/types/types';
import { formatMediaFieldWithLogging } from '@/helpers/utils';

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
  ): Promise<ReviewsWithMedia> {
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
        result.productVariantId.toString(),
      );

      if (!mediaForReview) {
        throw new NotFoundException('Failed to upload review media file');
      }

      const returnResult = await this.prismaService.reviews.findUnique({
        include: { media: true },
        where: { id: result.id },
      });

      if (!returnResult) {
        throw new NotFoundException('Failed to fetch created review');
      }

      // generate full http url for media files
      returnResult.media = formatMediaFieldWithLogging(
        returnResult.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'review',
        returnResult.id,
        this.logger,
      );

      this.logger.log('Review created successfully', returnResult.id);
      return returnResult;
    } catch (error) {
      this.logger.log('Error creating review', error);
      throw new BadRequestException('Failed to create review');
    }
  }

  async findAll(
    page: number,
    perPage: number,
  ): Promise<ReviewsWithMedia[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ReviewsWithMedia,
        Prisma.ReviewsFindManyArgs
      >(
        this.prismaService.reviews,
        { include: { media: true }, orderBy: { id: 'asc' } },
        { page: page },
      );

      // generate full http url for media files
      for (let i = 0; i < result.data.length; i++) {
        result.data[i].media = formatMediaFieldWithLogging(
          result.data[i].media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'review',
          result.data[i].id,
          this.logger,
        );
      }

      this.logger.log('Fetched reviews successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error fetching reviews', error);
      throw new BadRequestException('Failed to fetch reviews');
    }
  }

  async findOne(id: number): Promise<ReviewsWithMedia | null> {
    try {
      const result = await this.prismaService.reviews.findFirst({
        include: { media: true },
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Review not found!');
      }

      // generate full http url for media files
      result.media = formatMediaFieldWithLogging(
        result.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'review',
        result.id,
        this.logger,
      );

      this.logger.log('Fetched review successfully', id);

      return result;
    } catch (error) {
      this.logger.log('Error fetching review', error);
      throw new BadRequestException('Failed to fetch review');
    }
  }

  async update(
    id: number,
    updateReviewDto: UpdateReviewDto,
    files: Express.Multer.File[],
    adminId: string,
  ): Promise<ReviewsWithMedia> {
    try {
      // Find old review with media files and prepare to delete selected media files
      const oldReview = await this.prismaService.reviews.findUnique({
        include: { media: true },
        where: { id: id },
      });
      const oldMediaFiles = oldReview?.media;

      // dto have media ids to delete if you want to delete some media files and upload new files
      const { mediaIdsToDelete, ...updateData } = updateReviewDto;

      // update review data
      const newReview = await this.prismaService.reviews.update({
        include: { media: true },
        where: { id: id },
        data: updateData,
      });

      if (!newReview) {
        throw new NotFoundException('Failed to update review');
      }

      // update media files if have new uploaded files
      if (files && files.length > 0) {
        const mediaUploadForReview = await this.awsService.uploadManyReviewFile(
          files,
          adminId,
          id.toString(),
          newReview.productVariantId.toString(),
        );

        if (!mediaUploadForReview) {
          throw new NotFoundException('Failed to upload review media files');
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
      const resultReview = await this.prismaService.reviews.findUnique({
        include: { media: true },
        where: { id: newReview.id },
      });

      if (!resultReview) {
        throw new NotFoundException('Failed to retrieve updated review');
      }

      resultReview.media = formatMediaFieldWithLogging(
        resultReview.media,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'review',
        resultReview.id,
        this.logger,
      );
      // return updated review
      this.logger.log(
        'Review updated successfully with id: ' + resultReview.id,
      );

      return resultReview;
    } catch (error) {
      this.logger.log('Error updating review', error);
      throw new BadRequestException('Failed to update review');
    }
  }

  async remove(id: number): Promise<Reviews> {
    try {
      this.logger.log('Deleting review', id);

      // get review to delete associated media files from s3
      const reviewToDelete = await this.prismaService.reviews.findUnique({
        include: { media: true },
        where: { id: id },
      });

      if (!reviewToDelete) {
        throw new NotFoundException('Review not found!');
      }

      // delete review record from database
      const result = await this.prismaService.reviews.delete({
        where: { id: id },
      });

      if (reviewToDelete && reviewToDelete.media.length > 0) {
        // delete associated media files from s3
        for (const media of reviewToDelete.media) {
          await this.awsService.deleteFileFromS3(media.url);
        }
      }

      this.logger.log('Review deleted successfully', id);

      return result;
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
