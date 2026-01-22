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
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { OrderItemEntity } from './entities/order-item.entity';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import { OrderItemWithVariantEntity } from './entities/order-item-with-variant.entity';

@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @ApiOperation({ summary: 'Create a new order item' })
  @ApiBody({
    description:
      'Order item data with product variant and quantity information',
    type: CreateOrderItemDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Order item created successfully',
    type: OrderItemWithVariantEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Post()
  async create(@Body() createOrderItemDto: CreateOrderItemDto) {
    return await this.orderItemsService.create(createOrderItemDto);
  }

  @ApiOperation({ summary: 'Get all order items' })
  @ApiResponse({
    status: 200,
    description:
      'List of order items with product variant and media information',
    type: [OrderItemWithVariantEntity],
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
  @Roles('USER')
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.orderItemsService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get one order item' })
  @ApiResponse({
    status: 200,
    description: 'Order item with product variant and media information',
    type: OrderItemWithVariantEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.orderItemsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one order item' })
  @ApiBody({
    description: 'Order item update data with optional fields',
    type: UpdateOrderItemDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Order item updated successfully',
    type: OrderItemWithVariantEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ) {
    return await this.orderItemsService.update(+id, updateOrderItemDto);
  }

  @ApiOperation({ summary: 'Delete one order item' })
  @ApiResponse({
    status: 200,
    description: 'Delete one order item',
    type: OrderItemEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.orderItemsService.remove(+id);
  }
}
