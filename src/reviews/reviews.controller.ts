import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Create a new review' })
  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    return await this.reviewsService.create(createReviewDto);
  }

  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({ status: 200, description: 'Get all reviews' })
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.reviewsService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get a review' })
  @ApiResponse({ status: 200, description: 'Get a review' })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.reviewsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Update a review' })
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return await this.reviewsService.update(+id, updateReviewDto);
  }

  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Delete a review' })
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.reviewsService.remove(+id);
  }
}
