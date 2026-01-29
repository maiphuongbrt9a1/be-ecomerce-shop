import { ApiProperty } from '@nestjs/swagger';

enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class PaymentEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 1 })
  orderId: bigint;

  @ApiProperty({ example: 'TXN123456789' })
  transactionId: string;

  @ApiProperty({ example: 'Credit Card' })
  paymentMethod: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  paymentDate: Date;

  @ApiProperty({ example: 105.0 })
  amount: number;

  @ApiProperty({ example: 'VND' })
  currencyUnit: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  status: PaymentStatus;
}
