import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'Sample product name' })
  name: string;

  @ApiProperty({ example: 'Sample product description' })
  description: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Sample product price' })
  price: number;

  @IsNotEmpty()
  @ApiProperty({ example: 'Sample product SKU' })
  stockKeepingUnit: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Sample product stock' })
  stock: number;

  @IsOptional()
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @IsDate()
  updatedAt: Date;

  @IsOptional()
  categoryId: bigint;
}
