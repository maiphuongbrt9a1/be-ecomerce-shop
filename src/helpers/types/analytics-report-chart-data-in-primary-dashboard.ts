import { CustomerChartData } from './analytics-customer-chart-data';
import { RevenueChartData } from './analytics-revenue-chart-data';
import { SoldProductVariantChartData } from './analytics-sold-product-variant-chart-data';
import { TotalRevenueInRangeTime } from './analytics-total-revenue-in-range-time';

export type ChartData = {
  startDate: Date;
  endDate: Date;
  customer: CustomerChartData;
  soldProductVariant: SoldProductVariantChartData;
  revenue: RevenueChartData;
};

export type ReportData = {
  totalCustomers: number;
  totalSoldProductVariants: number;
  totalRevenue: TotalRevenueInRangeTime;
  chartData: ChartData;
};

export type AnalyticsReportChartDataInPrimaryDashboard = {
  currentReportData: ReportData;
  previousReportData: ReportData;
};
