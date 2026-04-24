import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsRevenueAmountEntity {
  @ApiProperty({ example: 2500000 })
  totalAmount: number;
}

export class AnalyticsCountEntity {
  @ApiProperty({ example: 15 })
  id: number;
}

export class AnalyticsTotalRevenueEntity {
  @ApiProperty({ type: AnalyticsRevenueAmountEntity })
  _sum: AnalyticsRevenueAmountEntity;

  @ApiProperty({ type: AnalyticsCountEntity })
  _count: AnalyticsCountEntity;

  @ApiProperty({ type: AnalyticsRevenueAmountEntity })
  _avg: AnalyticsRevenueAmountEntity;

  @ApiProperty({ type: AnalyticsRevenueAmountEntity })
  _min: AnalyticsRevenueAmountEntity;

  @ApiProperty({ type: AnalyticsRevenueAmountEntity })
  _max: AnalyticsRevenueAmountEntity;
}

export class AnalyticsDashboardCardNumberMetricEntity {
  @ApiProperty({ example: 120 })
  currentPeriod: number;

  @ApiProperty({ example: 98 })
  previousPeriod: number;

  @ApiProperty({ example: 22.45 })
  percentageChange: number;
}

export class AnalyticsDashboardCardRevenueMetricEntity {
  @ApiProperty({ type: AnalyticsTotalRevenueEntity })
  currentPeriod: AnalyticsTotalRevenueEntity;

  @ApiProperty({ type: AnalyticsTotalRevenueEntity })
  previousPeriod: AnalyticsTotalRevenueEntity;

  @ApiProperty({ example: 12.3 })
  percentageChange: number;
}
