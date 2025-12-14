import { ApiProperty } from '@nestjs/swagger';

export class OrderItemEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 1 })
  orderId: bigint;

  @ApiProperty({ example: 1 })
  productVariantId: bigint;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 50.00 })
  unitPrice: number;

  @ApiProperty({ example: 100.00 })
  totalPrice: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
