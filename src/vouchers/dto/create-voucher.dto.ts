import { DiscountType } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVoucherDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  discountType: DiscountType;

  @IsNotEmpty()
  @IsNumber()
  discountValue: number;

  @IsNotEmpty()
  @IsDate()
  validFrom: Date;

  @IsNotEmpty()
  @IsDate()
  validTo: Date;

  @IsOptional()
  @IsNumber()
  usageLimit: number;

  @IsNotEmpty()
  @IsNumber()
  timesUsed: number;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @IsDate()
  updatedAt: Date;

  @IsNotEmpty()
  createdBy: bigint;
}
