import { ApiProperty } from '@nestjs/swagger';

export class CartItemEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 1 })
  cartId: bigint;

  @ApiProperty({ example: 1 })
  productVariantId: bigint;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
