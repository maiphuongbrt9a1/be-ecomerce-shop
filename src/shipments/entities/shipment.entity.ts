import { ApiProperty } from '@nestjs/swagger';

enum ShipmentStatus {
  WAITING_FOR_PICKUP = 'WAITING_FOR_PICKUP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  DELIVERED_FAILED = 'DELIVERED_FAILED',
  RETURNED_TO_SENDER = 'RETURNED_TO_SENDER',
}

export class ShipmentEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 1 })
  orderId: bigint;

  @ApiProperty({ example: 1 })
  processByStaffId: bigint;

  @ApiProperty({
    example: '2024-01-05T00:00:00.000Z',
    description: 'at shop, estimate time when leave from shop',
  })
  estimatedDelivery: Date;

  @ApiProperty({
    example: '2024-01-05T00:00:00.000Z',
    nullable: true,
    description: 'at shop, actual time when leave from shop',
  })
  deliveredAt: Date | null;

  @ApiProperty({
    example: '2024-01-02T00:00:00.000Z',
    description: 'at customer, estimate time when arrive to customer',
  })
  estimatedShipDate: Date;

  @ApiProperty({
    example: '2024-01-02T00:00:00.000Z',
    nullable: true,
    description: 'at customer, actual time when arrive to customer',
  })
  shippedAt: Date | null;

  @ApiProperty({
    examples: [
      'Giao hàng nhanh',
      'Giao hàng tiết kiệm',
      'GrabExpress',
      'VNPost',
      'J&T Express',
    ],
  })
  carrier: string;

  @ApiProperty({ example: 'TRACK123456' })
  trackingNumber: string;

  @ApiProperty({
    enum: ShipmentStatus,
    example: ShipmentStatus.WAITING_FOR_PICKUP,
  })
  status: ShipmentStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
