import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { MediaEntity } from './entities/media.entity';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Public, Roles } from '@/decorator/customize';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiOperation({
    summary:
      'Create a new media file. Please use upload file functions in aws-s3 instead',
  })
  @ApiResponse({
    status: 201,
    description:
      'Create a new media file. Please use upload file functions in aws-s3 instead',
    type: MediaEntity,
  })
  @ApiBody({ type: CreateMediaDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Post()
  async create(@Body() createMediaDto: CreateMediaDto) {
    return await this.mediaService.create(createMediaDto);
  }

  @ApiOperation({ summary: 'Get all media files' })
  @ApiResponse({
    status: 200,
    description: 'Get all media files',
    type: [MediaEntity],
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
    return await this.mediaService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get one media file' })
  @ApiResponse({
    status: 200,
    description: 'Get one media file',
    type: MediaEntity,
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Public()
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.mediaService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one media file' })
  @ApiResponse({
    status: 200,
    description: 'Update one media file',
    type: MediaEntity,
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @ApiBody({ type: UpdateMediaDto })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
  ) {
    return await this.mediaService.update(+id, updateMediaDto);
  }

  @ApiOperation({ summary: 'Delete one media file' })
  @ApiResponse({
    status: 200,
    description: 'Delete one media file',
    type: MediaEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.mediaService.remove(+id);
  }
}
