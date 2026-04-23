import { PrismaService } from '@/prisma/prisma.service';
import { TotalRevenueInRangeTime } from '@/helpers/types/analytics-total-revenue-in-range-time';
import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsViewMode, OrderStatus } from '@prisma/client';
import dayjs from 'dayjs';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  constructor(private readonly prismaService: PrismaService) {}

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

  async getTotalRevenueInRangeTimeByViewMode(
    viewMode: AnalyticsViewMode,
    referenceDate: Date,
  ): Promise<TotalRevenueInRangeTime> {
    let endDate: Date = dayjs(referenceDate).toDate();
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
        throw new Error('Invalid view mode');
    }

    return this.getTotalRevenueInRangeTime(startDate, endDate);
  }
}
