import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@/user/entities/user.entity';
import { OrderFullInformationEntity } from '@/orders/entities/order-full-information.entity';

enum ShipmentStatus {
  WAITING_FOR_PICKUP = 'WAITING_FOR_PICKUP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  DELIVERED_FAILED = 'DELIVERED_FAILED',
  RETURNED_TO_SENDER = 'RETURNED_TO_SENDER',
}

export class ShipmentWithFullInformationEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 1 })
  orderId: bigint;

  @ApiProperty({ example: 1 })
  processByStaffId: bigint;

  @ApiProperty({ example: '2024-01-05T00:00:00.000Z' })
  estimatedDelivery: Date;

  @ApiProperty({ example: '2024-01-05T00:00:00.000Z', nullable: true })
  deliveredAt: Date | null;

  @ApiProperty({ example: '2024-01-02T00:00:00.000Z' })
  estimatedShipDate: Date;

  @ApiProperty({ example: '2024-01-02T00:00:00.000Z', nullable: true })
  shippedAt: Date | null;

  @ApiProperty({ example: 'FedEx' })
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

  @ApiProperty({ type: UserEntity })
  processByStaff: UserEntity;

  @ApiProperty({ type: OrderFullInformationEntity })
  order: OrderFullInformationEntity;
}
