import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  orderId: bigint;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  productVariantId: bigint;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  unitPrice: number;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  totalPrice: number;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  discountValue: number;

  @ApiProperty({ example: 'VND' })
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  currencyUnit: string;

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
}
