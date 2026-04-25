/**
 * Single sold product variant chart data point grouped by day.
 */
export type SoldProductVariantChartDataPoint = {
  date: string;
  totalSoldProductVariants: number;
};

/**
 * Sold product variant chart dataset returned by analytics query.
 */
export type SoldProductVariantChartData = SoldProductVariantChartDataPoint[];
