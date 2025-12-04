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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderEntity } from './entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Create a new order', type: OrderEntity })
  @ApiBody({ type: CreateOrderDto })
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.create(createOrderDto);
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Get all orders', type: [OrderEntity] })
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.ordersService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get all orders with their detail information' })
  @ApiResponse({
    status: 200,
    description: 'Get all orders with their detail information',
    type: [OrderEntity],
  })
  @Get('/order-detail-list')
  async getAllOrdersWithDetailInformation(
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.ordersService.getAllOrdersWithDetailInformation(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get one order' })
  @ApiResponse({ status: 200, description: 'Get one order', type: OrderEntity })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one order' })
  @ApiResponse({ status: 200, description: 'Update one order', type: OrderEntity })
  @ApiBody({ type: UpdateOrderDto })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.ordersService.update(+id, updateOrderDto);
  }

  @ApiOperation({ summary: 'Delete one order' })
  @ApiResponse({ status: 200, description: 'Delete one order', type: OrderEntity })
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.ordersService.remove(+id);
  }

  @ApiOperation({ summary: 'Get order detail information of one order' })
  @ApiResponse({
    status: 200,
    description: 'Get order detail information of one order',
    type: OrderEntity,
  })
  @Get('/:id/order-detail')
  async getOrderDetailInformation(@Param('id') id: string) {
    return await this.ordersService.getOrderDetailInformation(+id);
  }

  @ApiOperation({
    summary: 'Get order item list detail information of one order',
  })
  @ApiResponse({
    status: 200,
    description: 'Get order item list detail information of one order',
    type: OrderEntity,
  })
  @Get('/:id/order-item-list-detail')
  async getOrderItemListDetailInformation(@Param('id') id: string) {
    return await this.ordersService.getOrderItemListDetailInformation(+id);
  }

  @ApiOperation({
    summary: 'Get order shipments detail information of one order',
  })
  @ApiResponse({
    status: 200,
    description: 'Get order shipments detail information of one order',
    type: OrderEntity,
  })
  @Get('/:id/order-shipments-detail')
  async getOrderShipmentsDetailInformation(@Param('id') id: string) {
    return await this.ordersService.getOrderShipmentsDetailInformation(+id);
  }

  @ApiOperation({
    summary: 'Get order payment detail information of one order',
  })
  @ApiResponse({
    status: 200,
    description: 'Get order payment detail information of one order',
    type: OrderEntity,
  })
  @Get('/:id/order-payment-detail')
  async getOrderPaymentDetailInformation(@Param('id') id: string) {
    return await this.ordersService.getOrderPaymentDetailInformation(+id);
  }

  @ApiOperation({
    summary: 'Get order request detail information of one order',
  })
  @ApiResponse({
    status: 200,
    description: 'Get order request detail information of one order',
    type: OrderEntity,
  })
  @Get('/:id/order-request-detail')
  async getOrderRequestDetailInformation(@Param('id') id: string) {
    return await this.ordersService.getOrderRequestDetailInformation(+id);
  }
}
