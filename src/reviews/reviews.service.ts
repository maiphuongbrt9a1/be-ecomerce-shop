import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Media, Prisma, Reviews } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class ReviewsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createReviewDto: CreateReviewDto): Promise<Reviews> {
    const result = await this.prismaService.reviews.create({
      data: { ...createReviewDto },
    });

    return result;
  }

  async findAll(page: number, perPage: number): Promise<Reviews[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Reviews, Prisma.ReviewsFindManyArgs>(
      this.prismaService.reviews,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<Reviews | null> {
    const result = await this.prismaService.reviews.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new NotFoundException('Review not found!');
    }

    return result;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Reviews> {
    const result = await this.prismaService.reviews.update({
      where: { id: id },
      data: { ...updateReviewDto },
    });
    return result;
  }

  async remove(id: number): Promise<Reviews> {
    return await this.prismaService.reviews.delete({
      where: { id: id },
    });
  }

  async getAllMediaOfReview(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Media[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Media, Prisma.MediaFindManyArgs>(
      this.prismaService.media,
      { where: { reviewId: id }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }
}
