import { AnalyticsPaginationQueryDto } from '@/analytics/dto/analytics-pagination-query.dto';
import { DashboardCardQueryDto } from '@/analytics/dto/dashboard-card-query.dto';
import {
  AnalyticsDashboardCardNumberMetricEntity,
  AnalyticsDashboardCardRevenueMetricEntity,
} from '@/analytics/entities/analytics-dashboard-card-metric.entity';
import { AnalyticsTopRevenueUserEntity } from '@/analytics/entities/analytics-top-revenue-user.entity';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import { ProductVariantWithMediaEntity } from '@/product-variants/entities/product-variant-with-media.entity';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Get total revenue dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'Revenue metric retrieved successfully',
    type: AnalyticsDashboardCardRevenueMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({
    name: 'referenceDate',
    required: false,
    example: '2026-04-24T00:00:00.000Z',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-revenue')
  async getTotalRevenueForDashboardCard(@Query() query: DashboardCardQueryDto) {
    return await this.analyticsService.getTotalRevenueForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({ summary: 'Get total orders dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'Total orders metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({
    name: 'referenceDate',
    required: false,
    example: '2026-04-24T00:00:00.000Z',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-orders')
  async getTotalOrdersForDashboardCard(@Query() query: DashboardCardQueryDto) {
    return await this.analyticsService.getTotalOrdersForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({
    summary: 'Get payment-confirmed orders dashboard card metric',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment-confirmed orders metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-payment-confirmed-orders')
  async getTotalPaymentConfirmedOrdersForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getTotalPaymentConfirmedOrdersForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({ summary: 'Get cancelled orders dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'Cancelled orders metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-cancelled-orders')
  async getTotalCancelledOrdersForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getTotalCancelledOrdersForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({ summary: 'Get returned orders dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'Returned orders metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-returned-orders')
  async getTotalReturnedOrdersForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getTotalReturnedOrdersForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({ summary: 'Get delivered orders dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'Delivered orders metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-delivered-orders')
  async getTotalDeliveredOrdersForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getTotalDeliveredOrdersForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({ summary: 'Get delivery-failed orders dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'Delivery-failed orders metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-delivery-failed-orders')
  async getTotalDeliveryFailedOrdersForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getTotalDeliveryFailedOrdersForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({ summary: 'Get completed orders dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'Completed orders metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-completed-orders')
  async getTotalCompletedOrdersForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getTotalCompletedOrdersForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({ summary: 'Get paid payments dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'Paid payments metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-paid-payments')
  async getTotalPaidPaymentsForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getTotalPaidPaymentsForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({ summary: 'Get pending payments dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'Pending payments metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-pending-payments')
  async getTotalPendingPaymentsForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getTotalPendingPaymentsForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({ summary: 'Get failed payments dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'Failed payments metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-failed-payments')
  async getTotalFailedPaymentsForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getTotalFailedPaymentsForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({ summary: 'Get refunded payments dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'Refunded payments metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-refunded-payments')
  async getTotalRefundedPaymentsForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getTotalRefundedPaymentsForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({ summary: 'Get cancelled payments dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'Cancelled payments metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-cancelled-payments')
  async getTotalCancelledPaymentsForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getTotalCancelledPaymentsForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({ summary: 'Get total customers dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'Total customers metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-customers')
  async getTotalCustomersForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getTotalCustomersForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({ summary: 'Get new customers dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'New customers metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-new-customers')
  async getTotalNewCustomersForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getTotalNewCustomersForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({ summary: 'Get returning customers dashboard card metric' })
  @ApiResponse({
    status: 200,
    description: 'Returning customers metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/total-returning-customers')
  async getTotalReturningCustomersForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getTotalReturningCustomersForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({
    summary: 'Get customer retention rate dashboard card metric',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer retention rate metric retrieved successfully',
    type: AnalyticsDashboardCardNumberMetricEntity,
  })
  @ApiQuery({ name: 'viewMode', required: false, example: 'WEEKLY' })
  @ApiQuery({ name: 'referenceDate', required: false })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/customer-retention-rate')
  async getCustomerRetentionRateForDashboardCard(
    @Query() query: DashboardCardQueryDto,
  ) {
    return await this.analyticsService.getCustomerRetentionRateForDashboardCard(
      query.viewMode,
      query.referenceDate,
    );
  }

  @ApiOperation({
    summary: 'Get top selling product variants for dashboard card',
  })
  @ApiResponse({
    status: 200,
    description: 'Top selling product variants retrieved successfully',
    type: [ProductVariantWithMediaEntity],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 10 })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/top-selling-product-variants')
  async getProductVariantsTopSellingForDashboardCard(
    @Query() query: AnalyticsPaginationQueryDto,
  ) {
    return await this.analyticsService.getProductVariantsTopSellingForDashboardCard(
      query.page,
      query.perPage,
    );
  }

  @ApiOperation({ summary: 'Get top revenue users for dashboard card' })
  @ApiResponse({
    status: 200,
    description: 'Top revenue users retrieved successfully',
    type: [AnalyticsTopRevenueUserEntity],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 10 })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/top-revenue-users')
  async getTopRevenueUsersForDashboardCard(
    @Query() query: AnalyticsPaginationQueryDto,
  ) {
    return await this.analyticsService.getTopRevenueUsersForDashboardCard(
      query.page,
      query.perPage,
    );
  }

  @ApiOperation({ summary: 'Get top revenue staffs for dashboard card' })
  @ApiResponse({
    status: 200,
    description: 'Top revenue staffs retrieved successfully',
    type: [AnalyticsTopRevenueUserEntity],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 10 })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('dashboard-card/top-revenue-staffs')
  async getTopRevenueStaffsForDashboardCard(
    @Query() query: AnalyticsPaginationQueryDto,
  ) {
    return await this.analyticsService.getTopRevenueStaffsForDashboardCard(
      query.page,
      query.perPage,
    );
  }
}
