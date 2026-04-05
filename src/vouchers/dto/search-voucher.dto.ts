import { ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class SearchVoucherDto {
  @ApiPropertyOptional({ example: 'SAVE20', description: 'Partial match on voucher code (case-insensitive)' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ enum: DiscountType, example: 'PERCENTAGE' })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

}
