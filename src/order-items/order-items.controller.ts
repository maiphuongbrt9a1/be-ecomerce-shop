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
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderItemEntity } from './entities/order-item.entity';

@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @ApiOperation({ summary: 'Create a new order item' })
  @ApiResponse({
    status: 201,
    description: 'Create a new order item',
    type: OrderItemEntity,
  })
  @ApiBody({ type: CreateOrderItemDto })
  @Post()
  async create(@Body() createOrderItemDto: CreateOrderItemDto) {
    return await this.orderItemsService.create(createOrderItemDto);
  }

  @ApiOperation({ summary: 'Get all order items' })
  @ApiResponse({
    status: 200,
    description: 'Get all order items',
    type: [OrderItemEntity],
  })
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.orderItemsService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get one order item' })
  @ApiResponse({
    status: 200,
    description: 'Get one order item',
    type: OrderItemEntity,
  })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.orderItemsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one order item' })
  @ApiResponse({
    status: 200,
    description: 'Update one order item',
    type: OrderItemEntity,
  })
  @ApiBody({ type: UpdateOrderItemDto })
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
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.orderItemsService.remove(+id);
  }
}
