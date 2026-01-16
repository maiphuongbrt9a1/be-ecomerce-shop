import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReturnRequestsService } from './return-requests.service';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import { UpdateReturnRequestDto } from './dto/update-return-request.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import { ReturnRequestEntity } from './entities/return-request.entity';

@Controller('return-requests')
export class ReturnRequestsController {
  constructor(private readonly returnRequestsService: ReturnRequestsService) {}

  @ApiOperation({ summary: 'Create a new return request' })
  @ApiResponse({
    status: 201,
    description: 'Create a new return request',
    type: ReturnRequestEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @ApiBody({ type: CreateReturnRequestDto })
  @Post()
  async create(@Body() createReturnRequestDto: CreateReturnRequestDto) {
    return await this.returnRequestsService.create(createReturnRequestDto);
  }

  @ApiOperation({ summary: 'Get all return requests' })
  @ApiResponse({
    status: 200,
    description: 'Get all return requests',
    type: [ReturnRequestEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.returnRequestsService.findAll(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get one return request' })
  @ApiResponse({
    status: 200,
    description: 'Get one return request',
    type: ReturnRequestEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.returnRequestsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one return request' })
  @ApiResponse({
    status: 200,
    description: 'Update one return request',
    type: ReturnRequestEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @ApiBody({ type: UpdateReturnRequestDto })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateReturnRequestDto: UpdateReturnRequestDto,
  ) {
    return await this.returnRequestsService.update(+id, updateReturnRequestDto);
  }

  @ApiOperation({ summary: 'Delete one return request' })
  @ApiResponse({
    status: 200,
    description: 'Delete one return request',
    type: ReturnRequestEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.returnRequestsService.remove(+id);
  }
}
