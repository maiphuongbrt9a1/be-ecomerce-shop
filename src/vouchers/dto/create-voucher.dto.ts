import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVoucherDto {
  @ApiProperty({ example: 'fdsakjfhds4655456ewrew' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'free ship' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ example: 'FIXED_AMOUNT' })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 465 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  discountValue: number;

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  validFrom: Date;

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  validTo: Date;

  @ApiProperty({ example: 4741 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  usageLimit: number;

  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  timesUsed: number;

  @ApiProperty({ example: false })
  @IsNotEmpty()
  @IsBoolean()
  @Type(() => Boolean)
  isActive: boolean;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @ApiProperty({ example: 4567 })
  @IsNotEmpty()
  createdBy: bigint;
}
