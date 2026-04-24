import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsTopRevenueUserEntity {
  @ApiProperty({ example: 'John Doe' })
  userName: string;

  @ApiProperty({ example: 12 })
  totalOrdersNumber: number;

  @ApiProperty({ example: 8500000 })
  totalRevenue: number;
}
