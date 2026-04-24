/**
 * Top revenue user item returned by analytics ranking queries.
 */
export type AnalyticsTopRevenueUser = {
  userName: string;
  totalOrdersNumber: number;
  totalRevenue: number;
};

/**
 * List of users ranked by total revenue.
 */
export type AnalyticsTopRevenueUsers = AnalyticsTopRevenueUser[];
