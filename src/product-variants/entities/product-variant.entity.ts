import { ApiProperty } from '@nestjs/swagger';

export class ProductVariantEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 1315 })
  productId: bigint;

  @ApiProperty({ example: 852 })
  createByUserId: bigint;

  @ApiProperty({ example: 'name of product variant' })
  variantName: string;

  @ApiProperty({ example: 'red' })
  variantColor: string;

  @ApiProperty({ example: 'XL' })
  variantSize: string;

  @ApiProperty({ example: 46546 })
  price: number;

  @ApiProperty({ example: 851 })
  stock: number;

  @ApiProperty({ example: 'EWDGDSED715545D' })
  stockKeepingUnit: string;

  @ApiProperty({ example: 1325, nullable: true })
  voucherId: bigint | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
