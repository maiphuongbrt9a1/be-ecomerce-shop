import { TransformStringToBigint } from '@/decorator/customize';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({ example: 1315 })
  @IsNotEmpty()
  productId: bigint;

  @ApiProperty({ example: 852 })
  @IsNotEmpty()
  createByUserId: bigint;

  @ApiProperty({ example: 'name of product variant' })
  @IsString()
  @IsNotEmpty()
  variantName: string;

  @ApiProperty({ example: 'red' })
  @IsString()
  @IsNotEmpty()
  variantColor: string;

  @ApiProperty({ example: 'XL' })
  @IsString()
  @IsNotEmpty()
  variantSize: string;

  @ApiProperty({ example: 5.0 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  variantWeight: number; // in grams

  @ApiProperty({ example: 50.0 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  variantHeight: number; // in cm

  @ApiProperty({ example: 20.0 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  variantWidth: number; // in cm

  @ApiProperty({ example: 25.0 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  variantLength: number; // in cm

  @ApiProperty({ example: 46546 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 'VND' })
  @IsNotEmpty()
  @Type(() => String)
  currencyUnit: string;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  stock: number;

  @ApiProperty({ example: 'EWDGDSED715545D' })
  @IsString()
  @IsNotEmpty()
  stockKeepingUnit: string;

  @ApiProperty({ example: '1325', nullable: true })
  @TransformStringToBigint()
  voucherId: bigint | null;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @TransformStringToBigint()
  colorId: bigint;

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
