/**
 * Generic dashboard card response for current vs previous period metrics.
 */
export type AnalyticsDashboardCardMetric<T> = {
  currentPeriod: T;
  previousPeriod: T;
  percentageChange: number;
};
