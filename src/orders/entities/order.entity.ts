import { ApiProperty } from '@nestjs/swagger';

enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export class OrderEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 1 })
  userId: bigint;

  @ApiProperty({ example: 1 })
  shippingAddressId: bigint;

  @ApiProperty({ example: 1 })
  processByStaffId: bigint;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  orderDate: Date;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ example: 100.00 })
  subTotal: number;

  @ApiProperty({ example: 10.00 })
  shippingFee: number;

  @ApiProperty({ example: 5.00 })
  discount: number;

  @ApiProperty({ example: 105.00 })
  totalAmount: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
