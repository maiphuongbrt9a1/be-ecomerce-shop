import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AnalyticsTopRevenueUserEntity {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  userName: string;

  @ApiProperty({ example: 12 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  totalOrdersNumber: number;

  @ApiProperty({ example: 8500000 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  totalRevenue: number;
}
