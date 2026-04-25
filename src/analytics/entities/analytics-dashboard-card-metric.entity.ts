import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';

export class AnalyticsRevenueAmountEntity {
  @ApiProperty({ example: 2500000 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  totalAmount: number;
}

export class AnalyticsCountEntity {
  @ApiProperty({ example: 15 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  id: number;
}

export class AnalyticsTotalRevenueEntity {
  @ApiProperty({ type: AnalyticsRevenueAmountEntity })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AnalyticsRevenueAmountEntity)
  _sum: AnalyticsRevenueAmountEntity;

  @ApiProperty({ type: AnalyticsCountEntity })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AnalyticsCountEntity)
  _count: AnalyticsCountEntity;

  @ApiProperty({ type: AnalyticsRevenueAmountEntity })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AnalyticsRevenueAmountEntity)
  _avg: AnalyticsRevenueAmountEntity;

  @ApiProperty({ type: AnalyticsRevenueAmountEntity })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AnalyticsRevenueAmountEntity)
  _min: AnalyticsRevenueAmountEntity;

  @ApiProperty({ type: AnalyticsRevenueAmountEntity })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AnalyticsRevenueAmountEntity)
  _max: AnalyticsRevenueAmountEntity;
}

export class AnalyticsDashboardCardNumberMetricEntity {
  @ApiProperty({ example: 120 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  currentPeriod: number;

  @ApiProperty({ example: 98 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  previousPeriod: number;

  @ApiProperty({ example: 22.45 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  percentageChange: number;
}

export class AnalyticsDashboardCardRevenueMetricEntity {
  @ApiProperty({ type: AnalyticsTotalRevenueEntity })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AnalyticsTotalRevenueEntity)
  currentPeriod: AnalyticsTotalRevenueEntity;

  @ApiProperty({ type: AnalyticsTotalRevenueEntity })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AnalyticsTotalRevenueEntity)
  previousPeriod: AnalyticsTotalRevenueEntity;

  @ApiProperty({ example: 12.3 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  percentageChange: number;
}
