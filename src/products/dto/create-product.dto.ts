import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'Sample product name' })
  name: string;

  @ApiProperty({ example: 'Sample product description' })
  description: string;

  @IsNotEmpty()
  @ApiProperty({ example: 12 })
  price: number;

  @IsNotEmpty()
  @ApiProperty({ example: 'ADSFDSAF1463218FA' })
  stockKeepingUnit: string;

  @IsNotEmpty()
  @ApiProperty({ example: 25 })
  stock: number;

  @IsNotEmpty()
  @ApiProperty({ example: 1231 })
  createByUserId: bigint;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({ example: 1325 })
  @IsOptional()
  categoryId: bigint;
}
