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
import { OrderFullInformationEntity } from './entities/order-full-information.entity';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import { OrderItemWithVariantEntity } from '@/order-items/entities/order-item-with-variant.entity';
import { ShipmentWithFullInformationEntity } from '@/shipments/entities/shipment-with-full-information.entity';
import { PaymentEntity } from '@/payments/entities/payment.entity';
import { RequestWithMediaEntity } from '@/requests/entities/request-with-media.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description:
      'Order created successfully with full information including items, payments, and shipments',
    type: OrderFullInformationEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @ApiBody({
    description:
      'Order creation data with items, shipping address, and payment method information',
    type: CreateOrderDto,
  })
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.create(createOrderDto);
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: 200,
    description:
      'Retrieved all orders with full information including items, payments, and shipments',
    type: [OrderFullInformationEntity],
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
    description:
      'Retrieved all orders with full information including items, payments, shipments, and requests',
    type: [OrderFullInformationEntity],
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
  @ApiResponse({
    status: 200,
    description:
      'Retrieved order with full information including items, payments, shipments, and requests',
    type: OrderFullInformationEntity,
  })
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
    description: 'Order updated successfully',
    type: OrderEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @ApiBody({
    description:
      'Order update data with optional status, shipping address, pricing information',
    type: UpdateOrderDto,
  })
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
    description: 'Order deleted successfully',
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
    description:
      'Retrieved order with full information including user, items, shipments, payments, and requests',
    type: OrderFullInformationEntity,
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
    description:
      'Retrieved list of order items with product variant and media information',
    type: [OrderItemWithVariantEntity],
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
    description:
      'Retrieved list of shipments with full information including staff and order details',
    type: [ShipmentWithFullInformationEntity],
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
    description: 'Retrieved list of payments for the order',
    type: [PaymentEntity],
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
    description:
      'Retrieved list of requests for the order with media and staff information',
    type: [RequestWithMediaEntity],
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
