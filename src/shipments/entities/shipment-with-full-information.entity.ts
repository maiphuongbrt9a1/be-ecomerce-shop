import { ApiProperty } from '@nestjs/swagger';
import { UserWithMediaEntity } from '@/user/entities/user-with-media.entity';
import { OrderFullInformationEntity } from '@/orders/entities/order-full-information.entity';
import { ShipmentStatus } from '@prisma/client';

export class ShipmentWithFullInformationEntity {
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
    description: 'at shop, actual time when leave from shop',
    nullable: true,
  })
  deliveredAt: Date | null;

  @ApiProperty({
    example: '2024-01-02T00:00:00.000Z',
    description: 'at customer, estimate time when arrive to customer',
  })
  estimatedShipDate: Date;

  @ApiProperty({
    example: '2024-01-02T00:00:00.000Z',
    description: 'at customer, actual time when arrive to customer',
    nullable: true,
  })
  shippedAt: Date | null;

  @ApiProperty({
    examples: ['Giao hàng nhanh'],
    example: 'Giao hàng nhanh',
    description: 'Carrier for the shipment',
  })
  carrier: string;

  @ApiProperty({ example: 'TRACK123456' })
  trackingNumber: string;

  @ApiProperty({
    enum: ShipmentStatus,
    example: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: UserWithMediaEntity })
  processByStaff: UserWithMediaEntity;

  @ApiProperty({ type: OrderFullInformationEntity })
  order: OrderFullInformationEntity;
}
