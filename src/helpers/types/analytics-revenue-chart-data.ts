/**
 * Single revenue chart data point grouped by day.
 */
export type RevenueChartDataPoint = {
  date: string;
  revenue: number;
  orderCount: number;
};

/**
 * Revenue chart dataset returned by analytics query.
 */
export type RevenueChartData = RevenueChartDataPoint[];
