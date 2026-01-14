import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
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

  @ApiProperty({ example: 46546 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  price: number;

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
  @Transform(
    ({ value }) => {
      // Convert empty string to null
      if (value === '' || value === null || value === undefined) {
        return null;
      }

      // Convert string/number to BigInt
      if (typeof value === 'string') {
        try {
          return BigInt(value);
        } catch {
          throw new Error(
            `Invalid voucherId: "${value}" cannot be converted to BigInt`,
          );
        }
      }

      if (typeof value === 'number') {
        return BigInt(value);
      }

      if (typeof value === 'bigint') {
        return value;
      }

      return null;
    },
    { toClassOnly: true },
  )
  voucherId: bigint | null;

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
