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

/**
 * Customer chart data point for stacked column chart.
 */
export type CustomerChartDataPointForStackedColumnChart = {
  date: string;
  newCustomerCount: number;
  returningCustomerCount: number;
  totalCustomers: number;
};

/**
 * Customer chart dataset for stacked column chart returned by analytics query.
 */
export type CustomerChartDataForStackedColumnChart =
  CustomerChartDataPointForStackedColumnChart[];
