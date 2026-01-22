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
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
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
import { Roles } from '@/decorator/customize';
import { RequestWithMediaEntity } from './entities/request-with-media.entity';
import { RequestEntity } from './entities/request.entity';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @ApiOperation({ summary: 'Create a new request' })
  @ApiBody({
    description:
      'Request data with subject, description, status and attached files',
    schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', example: 'Product Return Request' },
        description: { type: 'string', example: 'The product arrived damaged' },
        status: {
          type: 'string',
          enum: ['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED'],
          example: 'PENDING',
        },
        orderId: { type: 'number', example: 1 },
        processByStaffId: { type: 'number', example: 1 },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Request media files',
        },
      },
      required: ['subject', 'description', 'orderId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Request created successfully',
    type: RequestWithMediaEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
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
  @ApiResponse({
    status: 200,
    description: 'Requests retrieved successfully',
    type: [RequestWithMediaEntity],
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
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.requestsService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get one request' })
  @ApiResponse({
    status: 200,
    description: 'Request retrieved successfully',
    type: RequestWithMediaEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.requestsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one request' })
  @ApiBody({
    description:
      'Request update data with optional subject, description, status and new files',
    schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', example: 'Product Return Request' },
        description: { type: 'string', example: 'Updated description' },
        status: {
          type: 'string',
          enum: ['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED'],
          example: 'IN_PROGRESS',
        },
        orderId: { type: 'number', example: 1 },
        processByStaffId: { type: 'number', example: 1 },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Request media files to add',
        },
        mediaIdsToDelete: {
          type: 'array',
          items: { type: 'string', example: '1' },
          description: 'Array of media IDs to delete',
        },
      },
      required: [],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Request updated successfully',
    type: RequestWithMediaEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @UseInterceptors(FilesInterceptor('files'))
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: RequestWithUserInJWTStrategy,
  ) {
    return await this.requestsService.update(
      +id,
      updateRequestDto,
      files,
      req.user.userId.toString(),
    );
  }

  @ApiOperation({ summary: 'Delete one request' })
  @ApiResponse({
    status: 200,
    description: 'Request deleted successfully',
    type: RequestEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.requestsService.remove(+id);
  }
}
