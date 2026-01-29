import { ApiProperty } from '@nestjs/swagger';
import { UserWithMediaEntity } from '@/user/entities/user-with-media.entity';
import { AddressEntity } from '@/address/entities/address.entity';
import { ShipmentEntity } from '@/shipments/entities/shipment.entity';
import { PaymentEntity } from '@/payments/entities/payment.entity';
import { RequestWithMediaEntity } from '@/requests/entities/request-with-media.entity';
import { OrderItemWithVariantEntity } from '@/order-items/entities/order-item-with-variant.entity';

export class OrderFullInformationEntity {
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

  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiProperty({ example: 100.0 })
  subTotal: number;

  @ApiProperty({ example: 10.0 })
  shippingFee: number;

  @ApiProperty({ example: 5.0 })
  discount: number;

  @ApiProperty({ example: 105.0 })
  totalAmount: number;

  @ApiProperty({ example: 'VND' })
  currencyUnit: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: UserWithMediaEntity })
  user: UserWithMediaEntity;

  @ApiProperty({ type: UserWithMediaEntity })
  processByStaff: UserWithMediaEntity;

  @ApiProperty({ type: AddressEntity })
  shippingAddress: AddressEntity;

  @ApiProperty({ type: [ShipmentEntity] })
  shipments: ShipmentEntity[];

  @ApiProperty({ type: [PaymentEntity] })
  payment: PaymentEntity[];

  @ApiProperty({ type: [RequestWithMediaEntity] })
  requests: RequestWithMediaEntity[];

  @ApiProperty({ type: [OrderItemWithVariantEntity] })
  orderItems: OrderItemWithVariantEntity[];
}
