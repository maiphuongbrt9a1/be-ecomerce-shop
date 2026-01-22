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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { OrderEntity } from './entities/order.entity';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Create a new order',
    type: OrderEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @ApiBody({ type: CreateOrderDto })
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.create(createOrderDto);
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: 200,
    description: 'Get all orders',
    type: [OrderEntity],
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
  @Roles('ADMIN', 'OPERATOR')
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
  @Roles('ADMIN', 'OPERATOR')
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
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one order' })
  @ApiResponse({
    status: 200,
    description: 'Update one order',
    type: OrderEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @ApiBody({ type: UpdateOrderDto })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.ordersService.update(+id, updateOrderDto);
  }

  @ApiOperation({ summary: 'Delete one order' })
  @ApiResponse({
    status: 200,
    description: 'Delete one order',
    type: OrderEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
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
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
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
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
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
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
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
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
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
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Get('/:id/order-request-detail')
  async getOrderRequestDetailInformation(@Param('id') id: string) {
    return await this.ordersService.getOrderRequestDetailInformation(+id);
  }
}
