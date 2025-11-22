import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @ApiOperation({ summary: 'Create a new request' })
  @ApiResponse({ status: 201, description: 'Create a new request' })
  @ApiBody({ type: CreateRequestDto })
  @Post()
  async create(@Body() createRequestDto: CreateRequestDto) {
    return await this.requestsService.create(createRequestDto);
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
