/**
 * Single customer chart data point grouped by day.
 */
export type CustomerChartDataPoint = {
  date: string;
  totalCustomers: number;
};

/**
 * Customer chart dataset returned by analytics query.
 */
export type CustomerChartData = CustomerChartDataPoint[];
