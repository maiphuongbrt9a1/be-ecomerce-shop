import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { RequestWithUserInJWTStrategy } from '@/helpers/auth/interfaces/RequestWithUser.interface';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Public, Roles } from '@/decorator/customize';
import { ReviewEntity } from './entities/review.entity';
import { ReviewWithMediaEntity } from './entities/review-with-media.entity';
import { MediaEntity } from '@/media/entities/media.entity';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({
    status: 201,
    description: 'Create a new review',
    type: ReviewWithMediaEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Review creation data with optional media files',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Review media files',
        },
        productId: { type: 'number', example: 851 },
        userId: { type: 'number', example: 851 },
        productVariantId: { type: 'number', example: 851 },
        rating: { type: 'number', example: 5, minimum: 1, maximum: 5 },
        comment: { type: 'string', example: 'Perfect' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
      required: ['productId', 'userId', 'productVariantId', 'rating'],
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  @Post()
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createReviewDto: CreateReviewDto,
    @Request() req: RequestWithUserInJWTStrategy,
  ) {
    return await this.reviewsService.create(
      files,
      createReviewDto,
      req.user.userId.toString(),
    );
  }

  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({
    status: 200,
    description: 'Get all reviews',
    type: [ReviewWithMediaEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of items per page',
  })
  @Public()
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.reviewsService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get a review' })
  @ApiResponse({
    status: 200,
    description: 'Get a review',
    type: ReviewWithMediaEntity,
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @Public()
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.reviewsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({
    status: 200,
    description: 'Update a review',
    type: ReviewWithMediaEntity,
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Review update data with optional media files',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Review media files',
        },
        productId: { type: 'number', example: 851 },
        userId: { type: 'number', example: 851 },
        productVariantId: { type: 'number', example: 851 },
        rating: { type: 'number', example: 5, minimum: 1, maximum: 5 },
        comment: { type: 'string', example: 'Perfect' },
        mediaIdsToDelete: {
          type: 'array',
          items: {
            type: 'string',
            format: 'int64',
            example: '9007199254740993',
          },
          description:
            'Array of media ids to delete. Big integers should be sent as strings.',
        },
        updatedAt: { type: 'string', format: 'date-time' },
      },
      required: [],
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: RequestWithUserInJWTStrategy,
  ) {
    return await this.reviewsService.update(
      +id,
      updateReviewDto,
      files,
      req.user.userId.toString(),
    );
  }

  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({
    status: 200,
    description: 'Delete a review',
    type: ReviewEntity,
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.reviewsService.remove(+id);
  }

  @ApiOperation({ summary: 'Get all media of review' })
  @ApiResponse({
    status: 200,
    description: 'Get all media of review',
    type: [MediaEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @Public()
  @Get('/:id/media-list')
  async getAllMediaOfReview(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.reviewsService.getAllMediaOfReview(
      +id,
      Number(page),
      Number(perPage),
    );
  }
}
