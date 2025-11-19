import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiOperation({ summary: 'Create a new media file' })
  @ApiResponse({ status: 201, description: 'Create a new media file' })
  @ApiBody({ type: CreateMediaDto })
  @Post()
  async create(@Body() createMediaDto: CreateMediaDto) {
    return await this.mediaService.create(createMediaDto);
  }

  @ApiOperation({ summary: 'Get all media files' })
  @ApiResponse({ status: 200, description: 'Get all media files' })
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.mediaService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get one media file' })
  @ApiResponse({ status: 200, description: 'Get one media file' })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.mediaService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one media file' })
  @ApiResponse({ status: 200, description: 'Update one media file' })
  @ApiBody({ type: UpdateMediaDto })
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
  ) {
    return await this.mediaService.update(+id, updateMediaDto);
  }

  @ApiOperation({ summary: 'Delete one media file' })
  @ApiResponse({ status: 200, description: 'Delete one media file' })
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.mediaService.remove(+id);
  }
}
