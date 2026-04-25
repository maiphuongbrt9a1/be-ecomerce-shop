import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AnalyticsTotalRevenueEntity } from './analytics-dashboard-card-metric.entity';

// 1. Các phần tử dữ liệu biểu đồ cho từng ngày
class CustomerChartDataItem {
  @ApiProperty({ example: '2026-04-20' })
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  date: string;

  @ApiProperty({ example: 125 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  totalCustomers: number;
}

class SoldProductVariantChartDataItem {
  @ApiProperty({ example: '2026-04-20' })
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  date: string;

  @ApiProperty({ example: 340 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  totalSoldProductVariants: number;
}

class RevenueChartDataItem {
  @ApiProperty({ example: '2026-04-20' })
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  date: string;

  @ApiProperty({ example: 12500000 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  revenue: number;

  @ApiProperty({ example: 45 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  orderCount: number;
}

// 2. Thông tin tổng doanh thu (từ aggregate)
// import { AnalyticsTotalRevenueEntity } from './analytics-dashboard-card-metric.entity';

// 3. Dữ liệu biểu đồ gom nhóm
class ChartDataBlock {
  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({ type: [CustomerChartDataItem] })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => CustomerChartDataItem)
  customer: CustomerChartDataItem[];

  @ApiProperty({ type: [SoldProductVariantChartDataItem] })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => SoldProductVariantChartDataItem)
  soldProductVariant: SoldProductVariantChartDataItem[];

  @ApiProperty({ type: [RevenueChartDataItem] })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RevenueChartDataItem)
  revenue: RevenueChartDataItem[];
}

// 4. Một báo cáo hoàn chỉnh của một kỳ (current hoặc previous)
class ReportDataItem {
  @ApiProperty({ example: 480 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  totalCustomers: number;

  @ApiProperty({ example: 1350 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  totalSoldProductVariants: number;

  @ApiProperty({ type: AnalyticsTotalRevenueEntity })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AnalyticsTotalRevenueEntity)
  totalRevenue: AnalyticsTotalRevenueEntity;

  @ApiProperty({ type: ChartDataBlock })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ChartDataBlock)
  chartData: ChartDataBlock;
}

// 5. Entity chính – response của API
export class AnalyticsReportChartDataInPrimaryDashboardEntity {
  @ApiProperty({ type: ReportDataItem })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ReportDataItem)
  currentReportData: ReportDataItem;

  @ApiProperty({ type: ReportDataItem })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ReportDataItem)
  previousReportData: ReportDataItem;
}
