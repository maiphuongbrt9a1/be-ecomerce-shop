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
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { RequestWithUserInJWTStrategy } from '@/helpers/auth/interfaces/RequestWithUser.interface';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Public, Roles } from '@/decorator/customize';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Create a new review' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @ApiBody({ type: CreateReviewDto })
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
  @ApiResponse({ status: 200, description: 'Get all reviews' })
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
  @ApiResponse({ status: 200, description: 'Get a review' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @Public()
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.reviewsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Update a review' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @ApiBody({ type: UpdateReviewDto })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return await this.reviewsService.update(+id, updateReviewDto);
  }

  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Delete a review' })
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
  @ApiResponse({ status: 200, description: 'Get all media of review' })
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
