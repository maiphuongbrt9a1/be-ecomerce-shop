import { CustomerChartDataForStackedColumnChart } from './analytics-customer-chart-data';
import {
  DailyReturningRateFromPreviousCustomerCohortChartData,
  RetentionRateSeriesItem,
} from './analytics-customer-retention-rate-chart-data';

export type CustomersReportChartDataInSecondaryDashboardInRangeTime = {
  startDate: Date;
  endDate: Date;
  customerChartDataForStackedColumnChart: CustomerChartDataForStackedColumnChart;
  dailyReturningRateFromPreviousCustomerCohortChartData: DailyReturningRateFromPreviousCustomerCohortChartData;
};

export type AnalyticsCustomersReportChartDataInSecondaryDashboard = {
  currentCustomerReportData: CustomersReportChartDataInSecondaryDashboardInRangeTime;
  previousCustomerReportData: CustomersReportChartDataInSecondaryDashboardInRangeTime;
  customerRetentionRateTimeSeries: RetentionRateSeriesItem[];
};
