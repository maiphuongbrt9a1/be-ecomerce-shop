import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import { ShipmentEntity } from './entities/shipment.entity';
import { ShipmentWithFullInformationEntity } from './entities/shipment-with-full-information.entity';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @ApiOperation({ summary: 'Create a new shipment' })
  @ApiBody({
    description:
      'Shipment creation data with order, staff assignment and delivery schedule',
    type: CreateShipmentDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Shipment created successfully with staff and order details',
    type: ShipmentWithFullInformationEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid shipment data',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Order or staff not found',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Post()
  async create(@Body() createShipmentDto: CreateShipmentDto) {
    return await this.shipmentsService.create(createShipmentDto);
  }

  @ApiOperation({ summary: 'Get all shipments' })
  @ApiResponse({
    status: 200,
    description:
      'Retrieved all shipments with staff and order information successfully',
    type: [ShipmentWithFullInformationEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({ status: 404, description: 'Not Found - No shipments found' })
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
  @Roles('ADMIN', 'OPERATOR')
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.shipmentsService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get one shipment' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved shipment with staff and order details successfully',
    type: ShipmentWithFullInformationEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid shipment ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Shipment does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR', 'USER')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.shipmentsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one shipment' })
  @ApiBody({
    description:
      'Shipment update data with optional tracking, status and delivery timestamps',
    type: UpdateShipmentDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Shipment updated successfully with staff and order details',
    type: ShipmentWithFullInformationEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid update data',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Shipment does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
  ) {
    return await this.shipmentsService.update(+id, updateShipmentDto);
  }

  @ApiOperation({ summary: 'Delete one shipment' })
  @ApiResponse({
    status: 200,
    description: 'Shipment deleted successfully',
    type: ShipmentEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid shipment ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Shipment does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.shipmentsService.remove(+id);
  }
}
