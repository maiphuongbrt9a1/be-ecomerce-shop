/**
 * Aggregated revenue metrics for a selected analytics time range.
 *
 * This type represents normalized order analytics values returned by
 * revenue reporting queries. All numeric fields are expected to be
 * non-null and default to 0 when source aggregate values are null.
 *
 * @typedef {Object} TotalRevenueInRangeTime
 * @property {{ totalAmount: number }} _sum - Total revenue from matched orders.
 * @property {{ id: number }} _count - Total number of matched orders.
 * @property {{ totalAmount: number }} _avg - Average order value.
 * @property {{ totalAmount: number }} _min - Minimum order value.
 * @property {{ totalAmount: number }} _max - Maximum order value.
 *
 * @remarks
 * - Used by analytics revenue endpoints/services.
 * - Values are grouped as Prisma-like aggregate buckets for consistency.
 * - Suitable for weekly, monthly, and yearly dashboard views.
 */
export type TotalRevenueInRangeTime = {
  _sum: {
    totalAmount: number;
  };
  _count: {
    id: number;
  };
  _avg: {
    totalAmount: number;
  };
  _min: {
    totalAmount: number;
  };
  _max: {
    totalAmount: number;
  };
};
