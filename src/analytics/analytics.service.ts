import { PrismaService } from '@/prisma/prisma.service';
import { TotalRevenueInRangeTime } from '@/helpers/types/analytics-total-revenue-in-range-time';
import { AnalyticsDashboardCardMetric } from '@/helpers/types/analytics-dashboard-card-metric';
import { AnalyticsTopRevenueUsers } from '@/helpers/types/analytics-top-revenue-users';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  AnalyticsViewMode,
  OrderStatus,
  PaymentStatus,
  Prisma,
  ProductVariants,
} from '@prisma/client';
import dayjs from 'dayjs';
import { createPaginator } from 'prisma-pagination';
import { ProductVariantsWithMediaInformation } from '@/helpers/types/types';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import { formatMediaFieldWithLogging } from '@/helpers/utils';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  /**
   * Calculates the start date of a period based on view mode and reference date.
   *
   * This method computes the start date of an analytics period by subtracting a duration
   * from the reference date based on the specified view mode. The reference date serves
   * as the end boundary, and the method returns the start boundary of the period.
   *
   * @param {AnalyticsViewMode} viewMode - The view mode determining period duration:
   *   - WEEKLY: Subtracts 7 days from reference date
   *   - MONTHLY: Subtracts 1 month from reference date
   *   - YEARLY: Subtracts 1 year from reference date
   * @param {Date} referenceDate - End boundary date for the period calculation (inclusive)
   *
   * @returns {Date} The calculated start date of the period (inclusive)
   *
   * @throws {Error} Throws error if viewMode is not one of the defined AnalyticsViewMode enum values
   *
   * @remarks
   * - Uses dayjs library for date manipulation and normalization
   * - Reference date is treated as the end of the period (inclusive)
   * - Returned start date is inclusive in range queries
   * - Uses standard duration units: days for WEEKLY, months for MONTHLY, years for YEARLY
   * - Invalid view modes trigger error logging and exception throwing
   * - Result is suitable for use as startDate parameter in aggregate queries
   */
  calculateStartTimeOfViewMode(
    viewMode: AnalyticsViewMode,
    referenceDate: Date,
  ): Date {
    const endDate: Date = dayjs(referenceDate).toDate();
    let startDate: Date = dayjs(referenceDate).toDate();

    switch (viewMode) {
      case AnalyticsViewMode.WEEKLY:
        startDate = dayjs(endDate).subtract(7, 'day').toDate();
        break;
      case AnalyticsViewMode.MONTHLY:
        startDate = dayjs(endDate).subtract(1, 'month').toDate();
        break;
      case AnalyticsViewMode.YEARLY:
        startDate = dayjs(endDate).subtract(1, 'year').toDate();
        break;
      default:
        this.logger.error(`Invalid view mode`);
        throw new Error('Invalid view mode');
    }

    return startDate;
  }

  /**
   * Retrieves aggregated revenue metrics for orders within a time range.
   *
   * This method performs the following operations:
   * 1. Queries orders created between startDate (inclusive) and endDate (inclusive)
   * 2. Filters only revenue-qualified order statuses
   * 3. Calculates total revenue, total orders, average order value, min order value, and max order value
   * 4. Normalizes nullable aggregate values to 0
   * 5. Returns normalized analytics metrics for the selected period
   *
   * @param {Date} startDate - Start boundary of the analytics range (inclusive)
   * @param {Date} endDate - End boundary of the analytics range (inclusive)
   *
   * @returns {Promise<TotalRevenueInRangeTime>} Aggregated revenue metrics:
   *   - _sum.totalAmount: Total revenue in the period
   *   - _count.id: Total number of matched orders
   *   - _avg.totalAmount: Average order value
   *   - _min.totalAmount: Minimum order value
   *   - _max.totalAmount: Maximum order value
   *
   * @remarks
   * - Revenue includes only statuses: PAYMENT_CONFIRMED, WAITING_FOR_PICKUP, SHIPPED, DELIVERED, COMPLETED
   * - Uses half-open interval filtering: [startDate, endDate]
   * - Null aggregate values are converted to 0 for stable API responses
   */
  async getTotalRevenueInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<TotalRevenueInRangeTime> {
    // in current period,
    // calculate total revenue,
    // total orders, average order value, min order value, max order value
    const currentPeriod = await this.prismaService.orders.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: [
            OrderStatus.PAYMENT_CONFIRMED,
            OrderStatus.WAITING_FOR_PICKUP,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
            OrderStatus.COMPLETED,
          ],
        },
      },
      _sum: { totalAmount: true }, // Tính tổng doanh thu
      _count: { id: true }, // Đếm số lượng đơn hàng
      _avg: { totalAmount: true }, // Tính trung bình doanh thu
      _min: { totalAmount: true }, // Tìm đơn hàng có hóa đơn giá thấp nhất
      _max: { totalAmount: true }, // Tìm đơn hàng có hóa đơn giá cao nhất
    });

    const normalizedCurrentPeriod: TotalRevenueInRangeTime = {
      _sum: {
        totalAmount: currentPeriod._sum.totalAmount ?? 0,
      },
      _count: {
        id: currentPeriod._count.id ?? 0,
      },
      _avg: {
        totalAmount: currentPeriod._avg.totalAmount ?? 0,
      },
      _min: {
        totalAmount: currentPeriod._min.totalAmount ?? 0,
      },
      _max: {
        totalAmount: currentPeriod._max.totalAmount ?? 0,
      },
    };

    return normalizedCurrentPeriod;
  }

  /**
   * Retrieves total count of orders for revenue-qualified statuses within a time range.
   *
   * This method counts orders created between startDate (inclusive) and endDate (inclusive)
   * that have revenue-qualifying status values, providing the total number of orders
   * during the specified period.
   *
   * @param {Date} startDate - Start boundary of the time range (inclusive)
   * @param {Date} endDate - End boundary of the time range (inclusive)
   *
   * @returns {Promise<number>} Total number of matched orders during the specified period.
   *
   * @remarks
   * - Counts only orders with statuses: PAYMENT_CONFIRMED, WAITING_FOR_PICKUP, SHIPPED, DELIVERED, COMPLETED
   * - Uses inclusive boundaries for both startDate and endDate
   * - Returns 0 if no matching orders are found
   */
  async getTotalOrdersInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalOrders = await this.prismaService.orders.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: [
            OrderStatus.PAYMENT_CONFIRMED,
            OrderStatus.WAITING_FOR_PICKUP,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
            OrderStatus.COMPLETED,
          ],
        },
      },
    });
    return totalOrders;
  }

  /**
   * Retrieves total count of orders with PAYMENT_CONFIRMED status within a time range.
   *
   * This method counts orders created between startDate (inclusive) and endDate (inclusive)
   * that have PAYMENT_CONFIRMED status, providing metrics for payment confirmation tracking.
   *
   * @param {Date} startDate - Start boundary of the time range (inclusive)
   * @param {Date} endDate - End boundary of the time range (inclusive)
   *
   * @returns {Promise<number>} Total number of orders with PAYMENT_CONFIRMED status during the period.
   *
   * @remarks
   * - Counts only orders with PAYMENT_CONFIRMED status
   * - Uses inclusive boundaries for both startDate and endDate
   * - Returns 0 if no matching orders are found
   */
  async getTotalPaymentConfirmedOrdersInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalPaymentConfirmedOrders = await this.prismaService.orders.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: OrderStatus.PAYMENT_CONFIRMED,
      },
    });
    return totalPaymentConfirmedOrders;
  }

  /**
   * Retrieves total count of orders with CANCELLED status within a time range.
   *
   * This method counts orders created between startDate (inclusive) and endDate (inclusive)
   * that have CANCELLED status, providing metrics for cancelled order tracking.
   *
   * @param {Date} startDate - Start boundary of the time range (inclusive)
   * @param {Date} endDate - End boundary of the time range (inclusive)
   *
   * @returns {Promise<number>} Total number of cancelled orders during the period.
   *
   * @remarks
   * - Counts only orders with CANCELLED status
   * - Uses inclusive boundaries for both startDate and endDate
   * - Returns 0 if no matching orders are found
   */
  async getTotalCancelledOrdersInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalCancelledOrders = await this.prismaService.orders.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: OrderStatus.CANCELLED,
      },
    });
    return totalCancelledOrders;
  }

  /**
   * Retrieves total count of orders with RETURNED status within a time range.
   *
   * This method counts orders created between startDate (inclusive) and endDate (inclusive)
   * that have RETURNED status, providing metrics for returned order tracking.
   *
   * @param {Date} startDate - Start boundary of the time range (inclusive)
   * @param {Date} endDate - End boundary of the time range (inclusive)
   *
   * @returns {Promise<number>} Total number of returned orders during the period.
   *
   * @remarks
   * - Counts only orders with RETURNED status
   * - Uses inclusive boundaries for both startDate and endDate
   * - Returns 0 if no matching orders are found
   */
  async getTotalReturnedOrdersInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalReturnedOrders = await this.prismaService.orders.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: OrderStatus.RETURNED,
      },
    });
    return totalReturnedOrders;
  }

  /**
   * Retrieves total count of orders with DELIVERED status within a time range.
   *
   * This method counts orders created between startDate (inclusive) and endDate (inclusive)
   * that have DELIVERED status, providing metrics for delivered order tracking.
   *
   * @param {Date} startDate - Start boundary of the time range (inclusive)
   * @param {Date} endDate - End boundary of the time range (inclusive)
   *
   * @returns {Promise<number>} Total number of delivered orders during the period.
   *
   * @remarks
   * - Counts only orders with DELIVERED status
   * - Uses inclusive boundaries for both startDate and endDate
   * - Returns 0 if no matching orders are found
   */
  async getTotalDeliveredOrdersInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalDeliveredOrders = await this.prismaService.orders.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: OrderStatus.DELIVERED,
      },
    });
    return totalDeliveredOrders;
  }

  /**
   * Retrieves total count of orders with DELIVERED_FAILED status within a time range.
   *
   * This method counts orders created between startDate (inclusive) and endDate (inclusive)
   * that have DELIVERED_FAILED status, providing metrics for failed delivery tracking.
   *
   * @param {Date} startDate - Start boundary of the time range (inclusive)
   * @param {Date} endDate - End boundary of the time range (inclusive)
   *
   * @returns {Promise<number>} Total number of orders with failed delivery during the period.
   *
   * @remarks
   * - Counts only orders with DELIVERED_FAILED status
   * - Uses inclusive boundaries for both startDate and endDate
   * - Returns 0 if no matching orders are found
   */
  async getTotalDeliveryFailedOrdersInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalDeliveryFailedOrders = await this.prismaService.orders.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: OrderStatus.DELIVERED_FAILED,
      },
    });
    return totalDeliveryFailedOrders;
  }

  /**
   * Retrieves total count of orders with COMPLETED status within a time range.
   *
   * This method counts orders created between startDate (inclusive) and endDate (inclusive)
   * that have COMPLETED status, providing metrics for completed order tracking.
   *
   * @param {Date} startDate - Start boundary of the time range (inclusive)
   * @param {Date} endDate - End boundary of the time range (inclusive)
   *
   * @returns {Promise<number>} Total number of completed orders during the period.
   *
   * @remarks
   * - Counts only orders with COMPLETED status
   * - Uses inclusive boundaries for both startDate and endDate
   * - Returns 0 if no matching orders are found
   */
  async getTotalCompletedOrdersInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalCompletedOrders = await this.prismaService.orders.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: OrderStatus.COMPLETED,
      },
    });
    return totalCompletedOrders;
  }

  /**
   * Retrieves total count of payments with PAID status within a time range.
   *
   * This method counts payment records created between startDate (inclusive)
   * and endDate (inclusive) that have PAID status.
   *
   * @param {Date} startDate - Start boundary of the time range (inclusive)
   * @param {Date} endDate - End boundary of the time range (inclusive)
   *
   * @returns {Promise<number>} Total number of PAID payments during the period.
   *
   * @remarks
   * - Counts only payments with PAID status
   * - Uses inclusive boundaries for both startDate and endDate
   * - Returns 0 if no matching payments are found
   */
  async getTotalPaidPaymentsInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalPaidPayments = await this.prismaService.payments.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: PaymentStatus.PAID,
      },
    });
    return totalPaidPayments;
  }

  /**
   * Retrieves total count of payments with PENDING status within a time range.
   *
   * This method counts payment records created between startDate (inclusive)
   * and endDate (inclusive) that have PENDING status.
   *
   * @param {Date} startDate - Start boundary of the time range (inclusive)
   * @param {Date} endDate - End boundary of the time range (inclusive)
   *
   * @returns {Promise<number>} Total number of PENDING payments during the period.
   *
   * @remarks
   * - Counts only payments with PENDING status
   * - Uses inclusive boundaries for both startDate and endDate
   * - Returns 0 if no matching payments are found
   */
  async getTotalPendingPaymentsInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalPendingPayments = await this.prismaService.payments.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: PaymentStatus.PENDING,
      },
    });
    return totalPendingPayments;
  }

  /**
   * Retrieves total count of payments with FAILED status within a time range.
   *
   * This method counts payment records created between startDate (inclusive)
   * and endDate (inclusive) that have FAILED status.
   *
   * @param {Date} startDate - Start boundary of the time range (inclusive)
   * @param {Date} endDate - End boundary of the time range (inclusive)
   *
   * @returns {Promise<number>} Total number of FAILED payments during the period.
   *
   * @remarks
   * - Counts only payments with FAILED status
   * - Uses inclusive boundaries for both startDate and endDate
   * - Returns 0 if no matching payments are found
   */
  async getTotalFailedPaymentsInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalFailedPayments = await this.prismaService.payments.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: PaymentStatus.FAILED,
      },
    });
    return totalFailedPayments;
  }

  /**
   * Retrieves total count of payments with REFUNDED status within a time range.
   *
   * This method counts payment records created between startDate (inclusive)
   * and endDate (inclusive) that have REFUNDED status.
   *
   * @param {Date} startDate - Start boundary of the time range (inclusive)
   * @param {Date} endDate - End boundary of the time range (inclusive)
   *
   * @returns {Promise<number>} Total number of REFUNDED payments during the period.
   *
   * @remarks
   * - Counts only payments with REFUNDED status
   * - Uses inclusive boundaries for both startDate and endDate
   * - Returns 0 if no matching payments are found
   */
  async getTotalRefundedPaymentsInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalRefundedPayments = await this.prismaService.payments.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: PaymentStatus.REFUNDED,
      },
    });
    return totalRefundedPayments;
  }

  /**
   * Retrieves total count of payments with CANCELLED status within a time range.
   *
   * This method counts payment records created between startDate (inclusive)
   * and endDate (inclusive) that have CANCELLED status.
   *
   * @param {Date} startDate - Start boundary of the time range (inclusive)
   * @param {Date} endDate - End boundary of the time range (inclusive)
   *
   * @returns {Promise<number>} Total number of CANCELLED payments during the period.
   *
   * @remarks
   * - Counts only payments with CANCELLED status
   * - Uses inclusive boundaries for both startDate and endDate
   * - Returns 0 if no matching payments are found
   */
  async getTotalCancelledPaymentsInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalCancelledPayments = await this.prismaService.payments.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: PaymentStatus.CANCELLED,
      },
    });
    return totalCancelledPayments;
  }

  /**
   * Retrieves total count of customers with at least one qualified order in a time range.
   *
   * This method counts users who have at least one order created between startDate
   * (inclusive) and endDate (inclusive), considering only revenue-qualified order statuses.
   *
   * @param {Date} startDate - Start boundary of the time range (inclusive)
   * @param {Date} endDate - End boundary of the time range (inclusive)
   *
   * @returns {Promise<number>} Total number of customers active in the specified period.
   *
   * @remarks
   * - Requires at least one order in the current period
   * - Counts only orders with statuses: PAYMENT_CONFIRMED, WAITING_FOR_PICKUP, SHIPPED, DELIVERED, COMPLETED
   * - Uses inclusive boundaries for both startDate and endDate
   * - Returns 0 if no matching customers are found
   */
  async getTotalCustomersInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalCustomers = await this.prismaService.user.count({
      where: {
        // customer has least one order in current period
        orders: {
          some: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: {
              in: [
                OrderStatus.PAYMENT_CONFIRMED,
                OrderStatus.WAITING_FOR_PICKUP,
                OrderStatus.SHIPPED,
                OrderStatus.DELIVERED,
                OrderStatus.COMPLETED,
              ],
            },
          },
        },
      },
    });
    return totalCustomers;
  }

  /**
   * Retrieves total count of new customers in a time range.
   *
   * New customers are defined as users who either created their account in the
   * current period, or created it before the current period but had no qualified
   * orders before startDate. In both cases, they must have at least one qualified
   * order in the current period.
   *
   * @param {Date} startDate - Start boundary of the time range (inclusive)
   * @param {Date} endDate - End boundary of the time range (inclusive)
   *
   * @returns {Promise<number>} Total number of new customers during the period.
   *
   * @remarks
   * - New customer criteria combines account creation time and prior order history
   * - Requires at least one order in the current period
   * - Uses qualified statuses: PAYMENT_CONFIRMED, WAITING_FOR_PICKUP, SHIPPED, DELIVERED, COMPLETED
   * - Uses inclusive boundaries for both startDate and endDate
   * - Returns 0 if no matching customers are found
   */
  async getTotalNewCustomersInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalNewCustomers = await this.prismaService.user.count({
      where: {
        AND: [
          // defined as customers who created their account in the current period
          // OR created their account before current period
          // but have no orders before current period
          {
            OR: [
              // Customer created their account in the current period
              {
                createdAt: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              // Customer created their account before the current period
              // but has no orders before the current period
              {
                createdAt: {
                  lt: startDate,
                },
                orders: {
                  none: {
                    createdAt: {
                      lt: startDate,
                    },
                    status: {
                      in: [
                        OrderStatus.PAYMENT_CONFIRMED,
                        OrderStatus.WAITING_FOR_PICKUP,
                        OrderStatus.SHIPPED,
                        OrderStatus.DELIVERED,
                        OrderStatus.COMPLETED,
                      ],
                    },
                  },
                },
              },
            ],
          },
          // CUSTOMER has least one order in current period
          {
            orders: {
              some: {
                createdAt: {
                  gte: startDate,
                  lte: endDate,
                },
                status: {
                  in: [
                    OrderStatus.PAYMENT_CONFIRMED,
                    OrderStatus.WAITING_FOR_PICKUP,
                    OrderStatus.SHIPPED,
                    OrderStatus.DELIVERED,
                    OrderStatus.COMPLETED,
                  ],
                },
              },
            },
          },
        ],
      },
    });
    return totalNewCustomers;
  }

  /**
   * Retrieves total count of returning customers in a time range.
   *
   * Returning customers are users who have at least one qualified order in the
   * current period and at least one qualified order before the current period.
   *
   * @param {Date} startDate - Start boundary of the current period (inclusive)
   * @param {Date} endDate - End boundary of the current period (inclusive)
   *
   * @returns {Promise<number>} Total number of returning customers during the period.
   *
   * @remarks
   * - Requires at least one order in current period and at least one order before startDate
   * - Uses qualified statuses: PAYMENT_CONFIRMED, WAITING_FOR_PICKUP, SHIPPED, DELIVERED, COMPLETED
   * - Uses inclusive boundaries for the current period
   * - Returns 0 if no matching customers are found
   */
  async getTotalReturningCustomersInRangeTime(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalReturningCustomers = await this.prismaService.user.count({
      where: {
        AND: [
          // Customer has at least one order in the current period
          {
            orders: {
              some: {
                createdAt: {
                  gte: startDate,
                  lte: endDate,
                },
                status: {
                  in: [
                    OrderStatus.PAYMENT_CONFIRMED,
                    OrderStatus.WAITING_FOR_PICKUP,
                    OrderStatus.SHIPPED,
                    OrderStatus.DELIVERED,
                    OrderStatus.COMPLETED,
                  ],
                },
              },
            },
          },
          // Customer has at least one order before the current period
          {
            orders: {
              some: {
                createdAt: {
                  lt: startDate,
                },
                status: {
                  in: [
                    OrderStatus.PAYMENT_CONFIRMED,
                    OrderStatus.WAITING_FOR_PICKUP,
                    OrderStatus.SHIPPED,
                    OrderStatus.DELIVERED,
                    OrderStatus.COMPLETED,
                  ],
                },
              },
            },
          },
        ],
      },
    });
    return totalReturningCustomers;
  }

  /**
   * Retrieves aggregated revenue metrics for a specific view mode period.
   *
   * This method calculates revenue analytics from a reference date backwards according to
   * the specified view mode (weekly, monthly, yearly), providing normalized revenue metrics
   * including sum, count, average, minimum, and maximum order values.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<TotalRevenueInRangeTime>} Aggregated revenue metrics containing:
   *   - _sum.totalAmount: Total revenue in the period
   *   - _count.id: Total number of matched orders
   *   - _avg.totalAmount: Average order value
   *   - _min.totalAmount: Minimum order value
   *   - _max.totalAmount: Maximum order value
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Includes only revenue-qualified order statuses
   * - Null aggregate values are normalized to 0
   */
  async getTotalRevenueInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<TotalRevenueInRangeTime> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalRevenueInRangeTime(startDate, endDate);
  }

  /**
   * Retrieves total count of orders for a specific view mode period.
   *
   * This method counts orders from a reference date backwards according to the specified
   * view mode (weekly, monthly, yearly), providing the total number of revenue-qualified orders.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of orders in the specified period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Counts only revenue-qualified order statuses
   * - Returns 0 if no matching orders are found
   */
  async getTotalOrdersInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalOrdersInRangeTime(startDate, endDate);
  }

  /**
   * Retrieves count of PAYMENT_CONFIRMED orders for a specific view mode period.
   *
   * This method counts orders with PAYMENT_CONFIRMED status from a reference date backwards
   * according to the specified view mode (weekly, monthly, yearly).
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of orders with PAYMENT_CONFIRMED status during the period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Counts only PAYMENT_CONFIRMED status orders
   * - Returns 0 if no matching orders are found
   */
  async getTotalPaymentConfirmedOrdersInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalPaymentConfirmedOrdersInRangeTime(
      startDate,
      endDate,
    );
  }

  /**
   * Retrieves count of CANCELLED orders for a specific view mode period.
   *
   * This method counts orders with CANCELLED status from a reference date backwards
   * according to the specified view mode (weekly, monthly, yearly).
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of cancelled orders during the period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Counts only CANCELLED status orders
   * - Returns 0 if no matching orders are found
   */
  async getTotalCancelledOrdersInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalCancelledOrdersInRangeTime(startDate, endDate);
  }

  /**
   * Retrieves count of RETURNED orders for a specific view mode period.
   *
   * This method counts orders with RETURNED status from a reference date backwards
   * according to the specified view mode (weekly, monthly, yearly).
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of returned orders during the period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Counts only RETURNED status orders
   * - Returns 0 if no matching orders are found
   */
  async getTotalReturnedOrdersInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalReturnedOrdersInRangeTime(startDate, endDate);
  }

  /**
   * Retrieves count of DELIVERED orders for a specific view mode period.
   *
   * This method counts orders with DELIVERED status from a reference date backwards
   * according to the specified view mode (weekly, monthly, yearly).
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of delivered orders during the period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Counts only DELIVERED status orders
   * - Returns 0 if no matching orders are found
   */
  async getTotalDeliveredOrdersInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalDeliveredOrdersInRangeTime(startDate, endDate);
  }

  /**
   * Retrieves count of DELIVERED_FAILED orders for a specific view mode period.
   *
   * This method counts orders with DELIVERED_FAILED status from a reference date backwards
   * according to the specified view mode (weekly, monthly, yearly).
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of orders with failed delivery during the period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Counts only DELIVERED_FAILED status orders
   * - Returns 0 if no matching orders are found
   */
  async getTotalDeliveryFailedOrdersInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalDeliveryFailedOrdersInRangeTime(
      startDate,
      endDate,
    );
  }

  /**
   * Retrieves count of COMPLETED orders for a specific view mode period.
   *
   * This method counts orders with COMPLETED status from a reference date backwards
   * according to the specified view mode (weekly, monthly, yearly).
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of completed orders during the period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Counts only COMPLETED status orders
   * - Returns 0 if no matching orders are found
   */
  async getTotalCompletedOrdersInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalCompletedOrdersInRangeTime(startDate, endDate);
  }

  /**
   * Retrieves count of PAID payments for a specific view mode period.
   *
   * This method counts payments with PAID status from a reference date backwards
   * according to the specified view mode (weekly, monthly, yearly).
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of PAID payments during the period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Counts only PAID status payments
   * - Returns 0 if no matching payments are found
   */
  async getTotalPaidPaymentsInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalPaidPaymentsInRangeTime(startDate, endDate);
  }

  /**
   * Retrieves count of PENDING payments for a specific view mode period.
   *
   * This method counts payments with PENDING status from a reference date backwards
   * according to the specified view mode (weekly, monthly, yearly).
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of PENDING payments during the period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Counts only PENDING status payments
   * - Returns 0 if no matching payments are found
   */
  async getTotalPendingPaymentsInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalPendingPaymentsInRangeTime(startDate, endDate);
  }

  /**
   * Retrieves count of FAILED payments for a specific view mode period.
   *
   * This method counts payments with FAILED status from a reference date backwards
   * according to the specified view mode (weekly, monthly, yearly).
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of FAILED payments during the period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Counts only FAILED status payments
   * - Returns 0 if no matching payments are found
   */
  async getTotalFailedPaymentsInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalFailedPaymentsInRangeTime(startDate, endDate);
  }

  /**
   * Retrieves count of REFUNDED payments for a specific view mode period.
   *
   * This method counts payments with REFUNDED status from a reference date backwards
   * according to the specified view mode (weekly, monthly, yearly).
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of REFUNDED payments during the period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Counts only REFUNDED status payments
   * - Returns 0 if no matching payments are found
   */
  async getTotalRefundedPaymentsInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalRefundedPaymentsInRangeTime(startDate, endDate);
  }

  /**
   * Retrieves count of CANCELLED payments for a specific view mode period.
   *
   * This method counts payments with CANCELLED status from a reference date backwards
   * according to the specified view mode (weekly, monthly, yearly).
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of CANCELLED payments during the period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Counts only CANCELLED status payments
   * - Returns 0 if no matching payments are found
   */
  async getTotalCancelledPaymentsInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalCancelledPaymentsInRangeTime(startDate, endDate);
  }

  /**
   * Retrieves total count of customers for a specific view mode period.
   *
   * This method counts customers from a reference date backwards according to the
   * specified view mode (weekly, monthly, yearly), using the calculated period
   * boundaries derived from the reference date.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of customers in the specified period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Returns 0 if no matching customers are found
   */
  async getTotalCustomersInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalCustomersInRangeTime(startDate, endDate);
  }

  /**
   * Retrieves count of new customers for a specific view mode period.
   *
   * This method counts customers classified as new from a reference date backwards
   * according to the specified view mode (weekly, monthly, yearly).
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of new customers during the period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Returns 0 if no matching new customers are found
   */
  async getTotalNewCustomersInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalNewCustomersInRangeTime(startDate, endDate);
  }

  /**
   * Retrieves count of returning customers for a specific view mode period.
   *
   * This method counts customers classified as returning from a reference date
   * backwards according to the specified view mode (weekly, monthly, yearly).
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the period calculation (inclusive)
   *
   * @returns {Promise<number>} Total number of returning customers during the period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Calculates period backwards from referenceDate based on viewMode
   * - Returns 0 if no matching returning customers are found
   */
  async getTotalReturningCustomersInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    const endDate: Date = dayjs(referenceDate).toDate();
    const startDate: Date = this.calculateStartTimeOfViewMode(
      viewMode,
      referenceDate,
    );

    return await this.getTotalReturningCustomersInRangeTime(startDate, endDate);
  }

  /**
   * Calculates customer retention rate for a specific view mode period.
   *
   * Retention rate is computed by dividing the number of returning customers in the
   * current period by total customers in the previous period, then multiplying by 100.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - End date for the current period calculation (inclusive)
   *
   * @returns {Promise<number>} Customer retention rate percentage for the selected period.
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Returning customers: at least one order in current period and at least one order before it
   * - Previous period end date is derived from current period start date
   * - Formula: (returningCustomersCurrentPeriod / totalCustomersPreviousPeriod) * 100
   * - Returns 0 when total customers in previous period is 0
   */
  async getCustomerRetentionRateByViewMode(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date,
  ): Promise<number> {
    // returning customers are customers who have at least one order in the current period
    // and have at least one order before the current period
    const totalReturningCustomersInCurrentPeriod =
      await this.getTotalReturningCustomersInRangeTimeByViewMode(
        viewMode,
        referenceDate,
      );

    // end date of previous period is the start date of current period
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(viewMode, referenceDate);

    // total customer in previous period
    const totalCustomersInPreviousPeriod =
      await this.getTotalCustomersInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );

    return totalCustomersInPreviousPeriod > 0
      ? (totalReturningCustomersInCurrentPeriod /
          totalCustomersInPreviousPeriod) *
          100
      : 0;
  }

  /**
   * Retrieves revenue metrics comparing current period with previous period for dashboard display.
   *
   * This method calculates and compares total revenue between the current period and previous
   * period based on the view mode, computing the percentage change to show trend analysis
   * for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<TotalRevenueInRangeTime>>} Dashboard card metrics containing:
   *   - currentPeriod: Revenue metrics for the current period
   *   - previousPeriod: Revenue metrics for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period revenue is 0 or null
   * - Useful for KPI dashboard cards showing revenue trends
   */
  async getTotalRevenueForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<TotalRevenueInRangeTime>> {
    const referenceDateForCurrentPeriod = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );

    const totalRevenueInCurrentPeriod =
      await this.getTotalRevenueInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );

    const totalRevenueInPreviousPeriod =
      await this.getTotalRevenueInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );

    const percentageChange = totalRevenueInPreviousPeriod._sum.totalAmount
      ? ((totalRevenueInCurrentPeriod._sum.totalAmount -
          totalRevenueInPreviousPeriod._sum.totalAmount) /
          totalRevenueInPreviousPeriod._sum.totalAmount) *
        100
      : 0;

    return {
      currentPeriod: totalRevenueInCurrentPeriod,
      previousPeriod: totalRevenueInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves order count metrics comparing current period with previous period for dashboard display.
   *
   * This method calculates and compares the total number of orders between the current period
   * and previous period based on the view mode, computing the percentage change to show trend
   * analysis for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: Total order count for the current period
   *   - previousPeriod: Total order count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   * - Useful for KPI dashboard cards showing order volume trends
   */
  async getTotalOrdersForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );

    const totalOrdersInCurrentPeriod =
      await this.getTotalOrdersInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );

    const totalOrdersInPreviousPeriod =
      await this.getTotalOrdersInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );

    const percentageChange = totalOrdersInPreviousPeriod
      ? ((totalOrdersInCurrentPeriod - totalOrdersInPreviousPeriod) /
          totalOrdersInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalOrdersInCurrentPeriod,
      previousPeriod: totalOrdersInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves PAYMENT_CONFIRMED order count metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares the count of orders with PAYMENT_CONFIRMED status
   * between the current and previous period based on the view mode, computing percentage
   * change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: PAYMENT_CONFIRMED order count for the current period
   *   - previousPeriod: PAYMENT_CONFIRMED order count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   * - Useful for tracking payment confirmation rate trends
   */
  async getTotalPaymentConfirmedOrdersForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );

    const totalPaymentConfirmedOrdersInCurrentPeriod =
      await this.getTotalPaymentConfirmedOrdersInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );

    const totalPaymentConfirmedOrdersInPreviousPeriod =
      await this.getTotalPaymentConfirmedOrdersInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );

    const percentageChange = totalPaymentConfirmedOrdersInPreviousPeriod
      ? ((totalPaymentConfirmedOrdersInCurrentPeriod -
          totalPaymentConfirmedOrdersInPreviousPeriod) /
          totalPaymentConfirmedOrdersInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalPaymentConfirmedOrdersInCurrentPeriod,
      previousPeriod: totalPaymentConfirmedOrdersInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves CANCELLED order count metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares the count of orders with CANCELLED status
   * between the current and previous period based on the view mode, computing percentage
   * change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: CANCELLED order count for the current period
   *   - previousPeriod: CANCELLED order count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   * - Useful for tracking cancellation rate trends
   */
  async getTotalCancelledOrdersForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );

    const totalCancelledOrdersInCurrentPeriod =
      await this.getTotalCancelledOrdersInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalCancelledOrdersInPreviousPeriod =
      await this.getTotalCancelledOrdersInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );
    const percentageChange = totalCancelledOrdersInPreviousPeriod
      ? ((totalCancelledOrdersInCurrentPeriod -
          totalCancelledOrdersInPreviousPeriod) /
          totalCancelledOrdersInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalCancelledOrdersInCurrentPeriod,
      previousPeriod: totalCancelledOrdersInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves RETURNED order count metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares the count of orders with RETURNED status
   * between the current and previous period based on the view mode, computing percentage
   * change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: RETURNED order count for the current period
   *   - previousPeriod: RETURNED order count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   * - Useful for tracking product return rate trends
   */
  async getTotalReturnedOrdersForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalReturnedOrdersInCurrentPeriod =
      await this.getTotalReturnedOrdersInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalReturnedOrdersInPreviousPeriod =
      await this.getTotalReturnedOrdersInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );
    const percentageChange = totalReturnedOrdersInPreviousPeriod
      ? ((totalReturnedOrdersInCurrentPeriod -
          totalReturnedOrdersInPreviousPeriod) /
          totalReturnedOrdersInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalReturnedOrdersInCurrentPeriod,
      previousPeriod: totalReturnedOrdersInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves DELIVERED order count metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares the count of orders with DELIVERED status
   * between the current and previous period based on the view mode, computing percentage
   * change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: DELIVERED order count for the current period
   *   - previousPeriod: DELIVERED order count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   * - Useful for tracking successful delivery rate trends
   */
  async getTotalDeliveredOrdersForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalDeliveredOrdersInCurrentPeriod =
      await this.getTotalDeliveredOrdersInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalDeliveredOrdersInPreviousPeriod =
      await this.getTotalDeliveredOrdersInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );
    const percentageChange = totalDeliveredOrdersInPreviousPeriod
      ? ((totalDeliveredOrdersInCurrentPeriod -
          totalDeliveredOrdersInPreviousPeriod) /
          totalDeliveredOrdersInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalDeliveredOrdersInCurrentPeriod,
      previousPeriod: totalDeliveredOrdersInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves DELIVERED_FAILED order count metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares the count of orders with DELIVERED_FAILED status
   * between the current and previous period based on the view mode, computing percentage
   * change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: DELIVERED_FAILED order count for the current period
   *   - previousPeriod: DELIVERED_FAILED order count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   * - Useful for tracking failed delivery rate trends
   */
  async getTotalDeliveryFailedOrdersForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalDeliveryFailedOrdersInCurrentPeriod =
      await this.getTotalDeliveryFailedOrdersInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalDeliveryFailedOrdersInPreviousPeriod =
      await this.getTotalDeliveryFailedOrdersInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );
    const percentageChange = totalDeliveryFailedOrdersInPreviousPeriod
      ? ((totalDeliveryFailedOrdersInCurrentPeriod -
          totalDeliveryFailedOrdersInPreviousPeriod) /
          totalDeliveryFailedOrdersInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalDeliveryFailedOrdersInCurrentPeriod,
      previousPeriod: totalDeliveryFailedOrdersInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves COMPLETED order count metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares the count of orders with COMPLETED status
   * between the current and previous period based on the view mode, computing percentage
   * change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: COMPLETED order count for the current period
   *   - previousPeriod: COMPLETED order count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   * - Useful for tracking order completion rate trends
   */
  async getTotalCompletedOrdersForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalCompletedOrdersInCurrentPeriod =
      await this.getTotalCompletedOrdersInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalCompletedOrdersInPreviousPeriod =
      await this.getTotalCompletedOrdersInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );
    const percentageChange = totalCompletedOrdersInPreviousPeriod
      ? ((totalCompletedOrdersInCurrentPeriod -
          totalCompletedOrdersInPreviousPeriod) /
          totalCompletedOrdersInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalCompletedOrdersInCurrentPeriod,
      previousPeriod: totalCompletedOrdersInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves PAID payment count metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares the count of payments with PAID status
   * between the current and previous period based on the view mode, computing percentage
   * change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: PAID payment count for the current period
   *   - previousPeriod: PAID payment count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   * - Useful for tracking successful payment trends
   */
  async getTotalPaidPaymentsForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalPaidPaymentsInCurrentPeriod =
      await this.getTotalPaidPaymentsInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalPaidPaymentsInPreviousPeriod =
      await this.getTotalPaidPaymentsInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );
    const percentageChange = totalPaidPaymentsInPreviousPeriod
      ? ((totalPaidPaymentsInCurrentPeriod -
          totalPaidPaymentsInPreviousPeriod) /
          totalPaidPaymentsInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalPaidPaymentsInCurrentPeriod,
      previousPeriod: totalPaidPaymentsInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves PENDING payment count metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares the count of payments with PENDING status
   * between the current and previous period based on the view mode, computing percentage
   * change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: PENDING payment count for the current period
   *   - previousPeriod: PENDING payment count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   * - Useful for tracking pending payment backlog trends
   */
  async getTotalPendingPaymentsForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalPendingPaymentsInCurrentPeriod =
      await this.getTotalPendingPaymentsInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalPendingPaymentsInPreviousPeriod =
      await this.getTotalPendingPaymentsInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );
    const percentageChange = totalPendingPaymentsInPreviousPeriod
      ? ((totalPendingPaymentsInCurrentPeriod -
          totalPendingPaymentsInPreviousPeriod) /
          totalPendingPaymentsInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalPendingPaymentsInCurrentPeriod,
      previousPeriod: totalPendingPaymentsInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves FAILED payment count metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares the count of payments with FAILED status
   * between the current and previous period based on the view mode, computing percentage
   * change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: FAILED payment count for the current period
   *   - previousPeriod: FAILED payment count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   * - Useful for monitoring payment failure trends
   */
  async getTotalFailedPaymentsForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalFailedPaymentsInCurrentPeriod =
      await this.getTotalFailedPaymentsInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalFailedPaymentsInPreviousPeriod =
      await this.getTotalFailedPaymentsInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );
    const percentageChange = totalFailedPaymentsInPreviousPeriod
      ? ((totalFailedPaymentsInCurrentPeriod -
          totalFailedPaymentsInPreviousPeriod) /
          totalFailedPaymentsInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalFailedPaymentsInCurrentPeriod,
      previousPeriod: totalFailedPaymentsInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves REFUNDED payment count metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares the count of payments with REFUNDED status
   * between the current and previous period based on the view mode, computing percentage
   * change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: REFUNDED payment count for the current period
   *   - previousPeriod: REFUNDED payment count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   * - Useful for tracking refund activity trends
   */
  async getTotalRefundedPaymentsForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalRefundedPaymentsInCurrentPeriod =
      await this.getTotalRefundedPaymentsInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalRefundedPaymentsInPreviousPeriod =
      await this.getTotalRefundedPaymentsInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );
    const percentageChange = totalRefundedPaymentsInPreviousPeriod
      ? ((totalRefundedPaymentsInCurrentPeriod -
          totalRefundedPaymentsInPreviousPeriod) /
          totalRefundedPaymentsInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalRefundedPaymentsInCurrentPeriod,
      previousPeriod: totalRefundedPaymentsInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves CANCELLED payment count metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares the count of payments with CANCELLED status
   * between the current and previous period based on the view mode, computing percentage
   * change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: CANCELLED payment count for the current period
   *   - previousPeriod: CANCELLED payment count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   * - Useful for tracking cancelled payment trends
   */
  async getTotalCancelledPaymentsForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalCancelledPaymentsInCurrentPeriod =
      await this.getTotalCancelledPaymentsInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalCancelledPaymentsInPreviousPeriod =
      await this.getTotalCancelledPaymentsInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );
    const percentageChange = totalCancelledPaymentsInPreviousPeriod
      ? ((totalCancelledPaymentsInCurrentPeriod -
          totalCancelledPaymentsInPreviousPeriod) /
          totalCancelledPaymentsInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalCancelledPaymentsInCurrentPeriod,
      previousPeriod: totalCancelledPaymentsInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves customer count metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares the total number of customers between the
   * current and previous period based on the selected view mode, then computes
   * percentage change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: Total customer count for the current period
   *   - previousPeriod: Total customer count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change formula: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   */
  async getTotalCustomersForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalCustomersInCurrentPeriod =
      await this.getTotalCustomersInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalCustomersInPreviousPeriod =
      await this.getTotalCustomersInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );
    const percentageChange = totalCustomersInPreviousPeriod
      ? ((totalCustomersInCurrentPeriod - totalCustomersInPreviousPeriod) /
          totalCustomersInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalCustomersInCurrentPeriod,
      previousPeriod: totalCustomersInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves new-customer metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares the number of new customers between the
   * current and previous period based on the selected view mode, then computes
   * percentage change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: New-customer count for the current period
   *   - previousPeriod: New-customer count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change formula: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   */
  async getTotalNewCustomersForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalNewCustomersInCurrentPeriod =
      await this.getTotalNewCustomersInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalNewCustomersInPreviousPeriod =
      await this.getTotalNewCustomersInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );
    const percentageChange = totalNewCustomersInPreviousPeriod
      ? ((totalNewCustomersInCurrentPeriod -
          totalNewCustomersInPreviousPeriod) /
          totalNewCustomersInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalNewCustomersInCurrentPeriod,
      previousPeriod: totalNewCustomersInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves returning-customer metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares the number of returning customers between
   * the current and previous period based on the selected view mode, then computes
   * percentage change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: Returning-customer count for the current period
   *   - previousPeriod: Returning-customer count for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change formula: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period count is 0
   */
  async getTotalReturningCustomersForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    // Implementation for getting total returning customers for dashboard card
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(viewMode, referenceDate);

    const totalReturningCustomersInCurrentPeriod =
      await this.getTotalReturningCustomersInRangeTimeByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const totalReturningCustomersInPreviousPeriod =
      await this.getTotalReturningCustomersInRangeTimeByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );
    const percentageChange = totalReturningCustomersInPreviousPeriod
      ? ((totalReturningCustomersInCurrentPeriod -
          totalReturningCustomersInPreviousPeriod) /
          totalReturningCustomersInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: totalReturningCustomersInCurrentPeriod,
      previousPeriod: totalReturningCustomersInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  /**
   * Retrieves customer-retention-rate metrics comparing current vs previous period for dashboard.
   *
   * This method calculates and compares customer retention rate percentages between
   * the current and previous period based on the selected view mode, then computes
   * percentage change for dashboard card visualization.
   *
   * @param {AnalyticsViewMode} viewMode - Time period mode: WEEKLY (7 days), MONTHLY (1 month), or YEARLY (1 year)
   * @param {Date} referenceDate - Reference date for period calculation (defaults to current date if not provided)
   *
   * @returns {Promise<AnalyticsDashboardCardMetric<number>>} Dashboard card metrics containing:
   *   - currentPeriod: Retention rate percentage for the current period
   *   - previousPeriod: Retention rate percentage for the previous period
   *   - percentageChange: Calculated percentage change from previous to current period
   *
   * @remarks
   * - Defaults to WEEKLY mode if viewMode is not specified
   * - Uses current date as reference date
   * - Percentage change formula: ((current - previous) / previous) * 100
   * - Returns 0% change if previous period retention rate is 0
   */
  async getCustomerRetentionRateForDashboardCard(
    viewMode: AnalyticsViewMode = AnalyticsViewMode.WEEKLY,
    referenceDate: Date = new Date(),
  ): Promise<AnalyticsDashboardCardMetric<number>> {
    // Implementation for getting customer retention rate for dashboard card
    const referenceDateForCurrentPeriod: Date = referenceDate;
    const referenceDateForPreviousPeriod: Date =
      this.calculateStartTimeOfViewMode(viewMode, referenceDate);
    const retentionRateInCurrentPeriod =
      await this.getCustomerRetentionRateByViewMode(
        viewMode,
        referenceDateForCurrentPeriod,
      );
    const retentionRateInPreviousPeriod =
      await this.getCustomerRetentionRateByViewMode(
        viewMode,
        referenceDateForPreviousPeriod,
      );
    const percentageChange = retentionRateInPreviousPeriod
      ? ((retentionRateInCurrentPeriod - retentionRateInPreviousPeriod) /
          retentionRateInPreviousPeriod) *
        100
      : 0;

    return {
      currentPeriod: retentionRateInCurrentPeriod,
      previousPeriod: retentionRateInPreviousPeriod,
      percentageChange: percentageChange,
    };
  }

  async getProductVariantsTopSellingForDashboardCard(
    page: number = 1,
    perPage: number = 10,
  ): Promise<ProductVariants[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const productVariantList = await paginate<
        ProductVariantsWithMediaInformation,
        Prisma.ProductVariantsFindManyArgs
      >(
        this.prismaService.productVariants,
        {
          include: {
            media: true,
            product: true,
          },
          orderBy: { soldQuantity: 'desc' },
        },
        { page: page },
      );

      // generate full http url for media files
      for (let i = 0; i < productVariantList.data.length; i++) {
        const productVariant = productVariantList.data[i];
        productVariant.media = formatMediaFieldWithLogging(
          productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'product variant',
          productVariant.id,
          this.logger,
        );
      }

      this.logger.log(
        `Retrieved ${productVariantList.data.length} product variants successfully`,
      );
      return productVariantList.data;
    } catch (error) {
      this.logger.error('Error retrieving product variants: ' + error);
      throw new NotFoundException('Failed to retrieve product variants');
    }
  }

  /**
   * Retrieves users ranked by total revenue generated from their orders.
   *
   * This method aggregates order data by user to calculate total revenue and order count,
   * then returns a paginated list of top-performing users ranked by total revenue in descending order.
   * Only includes users with confirmed orders (status: PAYMENT_CONFIRMED, WAITING_FOR_PICKUP, SHIPPED, DELIVERED, or COMPLETED).
   *
   * @param {number} page - Page number for pagination (defaults to 1)
   * @param {number} perPage - Number of users to return per page (defaults to 10)
   *
   * @returns {Promise<Array<{ userName: string; totalOrdersNumber: number; totalRevenue: number }>>}
   * Returns array of user revenue objects containing:
   *   - userName: User's full name (firstName + lastName concatenation)
   *   - totalOrdersNumber: Count of orders placed by the user
   *   - totalRevenue: Sum of totalAmount from all user orders
   *
   * @remarks
   * - Uses pagination to limit results (e.g., page=1, perPage=10 returns first 10 users)
   * - Orders results by totalRevenue in descending order
   * - Filters orders by confirmed payment statuses to ensure accurate revenue calculation
   * - If user has no firstName/lastName, returns empty string for that field
   * - Returns empty array if no users found
   *
   * @example
   * // Get top 10 revenue-generating users
   * const topUsers = await analyticsService.getTopRevenueUsersForDashboardCard(1, 10);
   * // Returns: [
   * //   { userName: 'John Doe', totalOrdersNumber: 15, totalRevenue: 5000000 },
   * //   { userName: 'Jane Smith', totalOrdersNumber: 12, totalRevenue: 4500000 }
   * // ]
   */
  async getTopRevenueUsersForDashboardCard(
    page: number = 1,
    perPage: number = 10,
  ): Promise<AnalyticsTopRevenueUsers> {
    try {
      const skip = (page - 1) * perPage;

      // Aggregate orders by userId to get revenue and order count
      const userOrderAggregates = await this.prismaService.orders.groupBy({
        by: ['userId'],
        where: {
          status: {
            in: [
              OrderStatus.PAYMENT_CONFIRMED,
              OrderStatus.WAITING_FOR_PICKUP,
              OrderStatus.SHIPPED,
              OrderStatus.DELIVERED,
              OrderStatus.COMPLETED,
            ],
          },
        },
        _sum: {
          totalAmount: true,
        },
        _count: true,
        orderBy: {
          _sum: {
            totalAmount: 'desc',
          },
        },
        skip: skip,
        take: perPage,
      });

      // If no users found, return empty array
      if (userOrderAggregates.length === 0) {
        this.logger.log('No users found with orders');
        return [];
      }

      // Extract user IDs to fetch user details
      const userIds = userOrderAggregates.map((agg) => agg.userId);

      // Fetch user details
      const users = await this.prismaService.user.findMany({
        where: {
          id: { in: userIds },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });

      // Map user IDs to user objects for easy lookup
      const userMap = new Map(users.map((user) => [user.id, user]));

      // Combine aggregated order data with user details and format response
      const topRevenueUsers = userOrderAggregates.map((aggregate) => {
        const user = userMap.get(aggregate.userId);
        const firstName = user?.firstName || '';
        const lastName = user?.lastName || '';
        const userName = `${firstName} ${lastName}`.trim();

        return {
          userName: userName,
          totalOrdersNumber: aggregate._count,
          totalRevenue: aggregate._sum.totalAmount || 0,
        };
      });

      this.logger.log(
        `Retrieved ${topRevenueUsers.length} top revenue users successfully`,
      );
      return topRevenueUsers;
    } catch (error) {
      this.logger.error('Error retrieving top revenue users: ' + error);
      throw new NotFoundException('Failed to retrieve top revenue users');
    }
  }

  /**
   * Retrieves staff ranked by total revenue from processed orders.
   *
   * This method aggregates orders by staff processor ID, calculates total revenue
   * and total processed-order count for each staff member, then returns a paginated
   * ranking sorted by revenue in descending order.
   *
   * @param {number} page - Page number for pagination (defaults to 1)
   * @param {number} perPage - Number of staff records per page (defaults to 10)
   *
   * @returns {Promise<AnalyticsTopRevenueUsers>} A list of ranked staff entries containing:
   *   - userName: Staff full name (firstName + lastName)
   *   - totalOrdersNumber: Number of qualified orders processed by the staff
   *   - totalRevenue: Sum of totalAmount from those orders
   *
   * @remarks
   * - Includes only orders that have a non-null processByStaffId
   * - Uses qualified statuses: PAYMENT_CONFIRMED, WAITING_FOR_PICKUP, SHIPPED, DELIVERED, COMPLETED
   * - Results are ordered by total revenue in descending order
   * - Returns an empty array when no matching staff/order aggregates exist
   * - Name fields may be empty when staff profile names are missing
   *
   * @throws {NotFoundException} Thrown when the staff revenue query fails.
   */
  async getTopRevenueStaffsForDashboardCard(
    page: number = 1,
    perPage: number = 10,
  ): Promise<AnalyticsTopRevenueUsers> {
    try {
      const skip = (page - 1) * perPage;

      // Aggregate orders by userId to get revenue and order count
      const staffOrderAggregates = await this.prismaService.orders.groupBy({
        by: ['processByStaffId'],
        where: {
          processByStaffId: { not: null },
          status: {
            in: [
              OrderStatus.PAYMENT_CONFIRMED,
              OrderStatus.WAITING_FOR_PICKUP,
              OrderStatus.SHIPPED,
              OrderStatus.DELIVERED,
              OrderStatus.COMPLETED,
            ],
          },
        },
        _sum: {
          totalAmount: true,
        },
        _count: true,
        orderBy: {
          _sum: {
            totalAmount: 'desc',
          },
        },
        skip: skip,
        take: perPage,
      });

      // If no staff found, return empty array
      if (staffOrderAggregates.length === 0) {
        this.logger.log('No staff found with orders');
        return [];
      }

      // Extract staff IDs to fetch staff details
      const staffIds: bigint[] = [];
      for (const agg of staffOrderAggregates) {
        if (agg.processByStaffId) {
          staffIds.push(agg.processByStaffId);
        }
      }

      // Fetch staff details
      const staffs = await this.prismaService.user.findMany({
        where: {
          id: { in: staffIds },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });

      // Map staff IDs to staff objects for easy lookup
      const staffMap = new Map(staffs.map((staff) => [staff.id, staff]));

      // Combine aggregated order data with staff details and format response
      const topRevenueStaffs: AnalyticsTopRevenueUsers = [];

      for (const aggregate of staffOrderAggregates) {
        if (aggregate.processByStaffId) {
          const staff = staffMap.get(aggregate.processByStaffId);
          const firstName = staff?.firstName || '';
          const lastName = staff?.lastName || '';
          const userName = `${firstName} ${lastName}`.trim();

          topRevenueStaffs.push({
            userName: userName,
            totalOrdersNumber: aggregate._count,
            totalRevenue: aggregate._sum.totalAmount || 0,
          });
        }
      }

      this.logger.log(
        `Retrieved ${topRevenueStaffs.length} top revenue staff successfully`,
      );

      return topRevenueStaffs;
    } catch (error) {
      this.logger.error('Error retrieving top revenue staff: ' + error);
      throw new NotFoundException('Failed to retrieve top revenue staff');
    }
  }
}
