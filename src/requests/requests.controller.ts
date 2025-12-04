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
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { RequestWithUserInJWTStrategy } from '@/helpers/auth/interfaces/RequestWithUser.interface';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @ApiOperation({ summary: 'Create a new request' })
  @ApiResponse({ status: 201, description: 'Create a new request' })
  @ApiBody({ type: CreateRequestDto })
  @UseInterceptors(FilesInterceptor('files'))
  @Post()
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createRequestDto: CreateRequestDto,
    @Request() req: RequestWithUserInJWTStrategy,
  ) {
    return await this.requestsService.create(
      files,
      createRequestDto,
      req.user.userId.toString(),
    );
  }

  @ApiOperation({ summary: 'Get all requests' })
  @ApiResponse({ status: 200, description: 'Get all requests' })
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.requestsService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get one request' })
  @ApiResponse({ status: 200, description: 'Get one request' })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.requestsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one request' })
  @ApiResponse({ status: 200, description: 'Update one request' })
  @ApiBody({ type: UpdateRequestDto })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return await this.requestsService.update(+id, updateRequestDto);
  }

  @ApiOperation({ summary: 'Delete one request' })
  @ApiResponse({ status: 200, description: 'Delete one request' })
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.requestsService.remove(+id);
  }
}
