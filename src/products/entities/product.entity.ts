import { ApiProperty } from '@nestjs/swagger';

export class ProductEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 'Product Name' })
  name: string;

  @ApiProperty({ example: 'Product description', nullable: true })
  description: string | null;

  @ApiProperty({ example: 99.99 })
  price: number;

  @ApiProperty({ example: 'VND' })
  currencyUnit: string;

  @ApiProperty({ example: 'SKU123456' })
  stockKeepingUnit: string;

  @ApiProperty({ example: 100 })
  stock: number;

  @ApiProperty({ example: 1, nullable: true })
  categoryId: bigint | null;

  @ApiProperty({ example: 1 })
  createByUserId: bigint;

  @ApiProperty({ example: 1, nullable: true })
  voucherId: bigint | null;

  @ApiProperty({ example: 1, nullable: true })
  shopOfficeId: bigint | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
