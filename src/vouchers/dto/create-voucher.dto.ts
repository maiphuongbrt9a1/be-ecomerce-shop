import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
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
  discountValue: number;

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsDate()
  validFrom: Date;

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsDate()
  validTo: Date;

  @ApiProperty({ example: 4741 })
  @IsOptional()
  @IsNumber()
  usageLimit: number;

  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  @IsNumber()
  timesUsed: number;

  @ApiProperty({ example: false })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({ example: 4567 })
  @IsNotEmpty()
  createdBy: bigint;
}
