import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
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

  @ApiProperty({ example: 4567 })
  @IsNotEmpty()
  createdBy: bigint;

  @ApiProperty({
    example: [1, 4],
    required: false,
    type: [Number],
    description:
      'Full membership of categories for this voucher. Omitted = leave untouched on update; [] = clear; [...] = set as the new full set.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  categoryIds?: number[];

  @ApiProperty({
    example: [12, 88],
    required: false,
    type: [Number],
    description: 'Full membership of products for this voucher. Same semantics as categoryIds.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  productIds?: number[];

  @ApiProperty({
    example: [203],
    required: false,
    type: [Number],
    description: 'Full membership of product variants for this voucher. Same semantics as categoryIds.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  variantIds?: number[];

  @ApiProperty({
    example: [9, 21, 47],
    required: false,
    type: [Number],
    description: 'Full membership of users this voucher is distributed to. Same semantics as categoryIds.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  userIds?: number[];
}
