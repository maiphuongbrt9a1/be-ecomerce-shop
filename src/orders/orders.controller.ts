import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Post,
  Req,
} from '@nestjs/common';
import type { RequestWithUser } from '@/helpers/auth/interfaces/RequestWithUser.interface';
import { OrdersService } from './orders.service';
import {
  UpdateOrderDto,
  UpdateOrderFromWaitingForPickupToShippedDto,
  UpdateOrderFromShippedToDeliveredDto,
  UpdateOrderFromShippedToDeliveryFailedDto,
} from './dto/update-order.dto';
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
import { CreateOrderDto } from './dto/create-order.dto';
// import { Request } from 'express';
// import { ClientIp } from '@/decorator/client-ip.decorator';

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
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - validation failed, checksum verification failed, insufficient stock, or order creation failed.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found - user, shipping address, product variant, or related entity not found.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error - missing server configuration or unexpected error during order creation.',
  })
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

  @ApiOperation({ summary: 'Get GHN pickup shifts' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved GHN pickup shifts successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 2 },
          title: {
            type: 'string',
            example: 'Ca lấy 02-04-2026 (12h00 - 18h00)',
          },
          from_time: { type: 'number', example: 43200 },
          to_time: { type: 'number', example: 64800 },
        },
      },
      example: [
        {
          id: 2,
          title: 'Ca lấy 02-04-2026 (12h00 - 18h00)',
          from_time: 43200,
          to_time: 64800,
        },
        {
          id: 3,
          title: 'Ca lấy 03-04-2026 (7h00 - 12h00)',
          from_time: 111600,
          to_time: 129600,
        },
        {
          id: 4,
          title: 'Ca lấy 03-04-2026 (12h00 - 18h00)',
          from_time: 129600,
          to_time: 151200,
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Unable to retrieve GHN pickup shifts',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('/ghn/pick-shift-list')
  async pickShiftOnGHNSystem() {
    return await this.ordersService.pickShiftOnGHNSystem();
  }

  @ApiOperation({ summary: 'Get all confirmed orders of shop' })
  @ApiResponse({
    status: 200,
    description:
      'Retrieved confirmed shop orders with full information including shipments, payments, and requests',
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
  @Get('/shop/confirmed-order-list')
  async getAllConfirmedOrdersOfShop(
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.ordersService.getAllConfirmedOrdersOfShop(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get all shop orders waiting for GHN pickup' })
  @ApiResponse({
    status: 200,
    description:
      'Retrieved shop orders waiting for GHN pickup with full information',
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
  @Get('/shop/waiting-for-ghn-pickup-order-list')
  async getAllShopOrdersWaitingForGHNPickup(
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.ordersService.getAllShopOrdersWaitingForGHNPickup(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get all shipped orders of shop' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved shipped shop orders with full information',
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
  @Get('/shop/shipped-order-list')
  async getAllShippedOrdersOfShop(
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.ordersService.getAllShippedOrdersOfShop(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get all delivered orders of shop' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved delivered shop orders with full information',
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
  @Get('/shop/delivered-order-list')
  async getAllDeliveredOrdersOfShop(
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.ordersService.getAllDeliveredOrdersOfShop(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get all completed orders of shop' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved completed shop orders with full information',
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
  @Get('/shop/completed-order-list')
  async getAllCompletedOrdersOfShop(
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.ordersService.getAllCompletedOrdersOfShop(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get all cancelled orders of shop' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved cancelled shop orders with full information',
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
  @Get('/shop/cancelled-order-list')
  async getAllCancelledOrdersOfShop(
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.ordersService.getAllCancelledOrdersOfShop(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get all returned orders of shop' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved returned shop orders with full information',
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
  @Get('/shop/returned-order-list')
  async getAllReturnedOrdersOfShop(
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.ordersService.getAllReturnedOrdersOfShop(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({
    summary: 'Get all shop orders with a PENDING or IN_PROGRESS return request',
  })
  @ApiResponse({
    status: 200,
    description:
      'Retrieved orders that currently have an unresolved return request awaiting staff review',
    type: [OrderFullInformationEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
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
  @Get('/shop/pending-return-request-list')
  async getOrdersWithPendingReturnRequestOfShop(
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.ordersService.getOrdersWithPendingReturnRequestOfShop(
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

  @ApiOperation({ summary: 'Update one order to waiting for pickup status' })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: OrderFullInformationEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @ApiBody({
    description:
      'Order update data with processByStaffId and GHN pick shift information',
    type: UpdateOrderDto,
  })
  @Patch('/:id/waiting-pickup')
  async updateOrderToWaitingPickup(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.ordersService.updateOrderToWaitingPickup(
      +id,
      updateOrderDto,
    );
  }

  @ApiOperation({
    summary: 'Update one order from waiting for pickup to shipped',
  })
  @ApiResponse({
    status: 200,
    description:
      'Order updated from WAITING_FOR_PICKUP to SHIPPED successfully',
    type: OrderFullInformationEntity,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - invalid order status, update flow failed, or transition not allowed',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - order or eligible shipment not found',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @ApiBody({
    description:
      'Order update payload containing processByStaffId for transition to SHIPPED',
    type: UpdateOrderFromWaitingForPickupToShippedDto,
  })
  @Patch('/:id/shipped')
  async updateOrderFromWaitingPickupToShipped(
    @Param('id') id: string,
    @Body()
    updateOrderFromWaitingForPickupToShippedDto: UpdateOrderFromWaitingForPickupToShippedDto,
  ) {
    return await this.ordersService.updateOrderFromWaitingPickupToShipped(
      +id,
      updateOrderFromWaitingForPickupToShippedDto,
    );
  }

  @ApiOperation({ summary: 'Update one order from shipped to delivered' })
  @ApiResponse({
    status: 200,
    description: 'Order updated from SHIPPED to DELIVERED successfully',
    type: OrderFullInformationEntity,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - invalid order status, payment data missing, or update flow failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - order not found',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @ApiBody({
    description:
      'Order update payload containing processByStaffId for transition to DELIVERED',
    type: UpdateOrderFromShippedToDeliveredDto,
  })
  @Patch('/:id/delivered')
  async updateOrderFromShippedToDelivered(
    @Param('id') id: string,
    @Body()
    updateOrderFromShippedToDeliveredDto: UpdateOrderFromShippedToDeliveredDto,
  ) {
    return await this.ordersService.updateOrderFromShippedToDelivered(
      +id,
      updateOrderFromShippedToDeliveredDto,
    );
  }

  @ApiOperation({ summary: 'Update one order from shipped to delivery failed' })
  @ApiResponse({
    status: 200,
    description: 'Order updated from SHIPPED to DELIVERY_FAILED successfully',
    type: OrderFullInformationEntity,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - invalid order status, refund request creation failed, or update flow failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - order not found',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @ApiBody({
    description:
      'Order update payload containing processByStaffId for transition to DELIVERY_FAILED',
    type: UpdateOrderFromShippedToDeliveryFailedDto,
  })
  @Patch('/:id/delivery-failed')
  async updateOrderFromShippedToDeliveryFailed(
    @Param('id') id: string,
    @Body()
    updateOrderFromShippedToDeliveryFailedDto: UpdateOrderFromShippedToDeliveryFailedDto,
  ) {
    return await this.ordersService.updateOrderFromShippedToDeliveryFailed(
      +id,
      updateOrderFromShippedToDeliveryFailedDto,
    );
  }

  @ApiOperation({ summary: 'Get reviews by current user for items in this order' })
  @ApiResponse({ status: 200, description: 'List of reviews by current user for variants in this order' })
  @ApiResponse({ status: 404, description: 'Order not found for this user' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Get('/:id/my-reviews')
  async getMyReviewsForOrder(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    return await this.ordersService.getMyReviewsForOrder(+id, req.user.id);
  }

  @ApiOperation({ summary: 'User confirms order received (DELIVERED → COMPLETED)' })
  @ApiResponse({ status: 200, description: 'Order confirmed as completed', type: OrderFullInformationEntity })
  @ApiResponse({ status: 400, description: 'Order is not in DELIVERED status' })
  @ApiResponse({ status: 404, description: 'Order not found for this user' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Patch('/:id/user-confirm-received')
  async userConfirmReceived(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    return await this.ordersService.userConfirmReceived(+id, req.user.id);
  }

  @ApiOperation({ summary: 'Cancel one order with full rollback of resources' })
  @ApiResponse({
    status: 200,
    description:
      'Order cancelled successfully with full information including rolled back items, payments, and shipments',
    type: OrderFullInformationEntity,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - order already cancelled, no shipments, no GHN order code, or in WAITING_FOR_PICKUP status',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - order with given ID not found',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error - GHN cancellation failed or unexpected error during order cancellation',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @Post('/:id/cancel')
  /* async cancelOrder(@Param('id') id: string, @ClientIp() clientIp: string) {
    return await this.ordersService.cancelOrder(+id, clientIp);
  } */
  async cancelOrder(@Param('id') id: string) {
    return await this.ordersService.cancelOrder(+id);
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
