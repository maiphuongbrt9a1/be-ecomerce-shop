import { ApiPropertyOptional } from '@nestjs/swagger';
import { AnalyticsViewMode } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';

export class DashboardCardQueryDto {
  @ApiPropertyOptional({
    enum: AnalyticsViewMode,
    default: AnalyticsViewMode.WEEKLY,
    description: 'Analytics period view mode',
  })
  @IsOptional()
  @IsEnum(AnalyticsViewMode)
  viewMode?: AnalyticsViewMode;

  @ApiPropertyOptional({
    example: '2026-04-24T00:00:00.000Z',
    description:
      'Reference date for period calculation. Defaults to current date when omitted.',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  referenceDate?: Date;
}
