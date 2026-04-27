import { Prisma } from '@prisma/client';

export type DailyReturningRateFromPreviousCustomerCohortPoint = {
  date: string;
  customerRetentionRate: Prisma.Decimal | number;
};

export type DailyReturningRateFromPreviousCustomerCohortChartData =
  DailyReturningRateFromPreviousCustomerCohortPoint[];

export type RetentionRateSeriesItem = {
  period: string; // '2026-W15' or '2026-04'
  retentionRate: number;
};
