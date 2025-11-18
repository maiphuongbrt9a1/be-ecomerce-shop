import { PaymentStatus } from '@prisma/client';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  orderId: bigint;

  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string; // COD, VNPAY, MOMO

  @IsNotEmpty()
  @IsDate()
  paymentDate: Date;

  @IsNotEmpty()
  @IsDate()
  amount: number;

  @IsNotEmpty()
  @IsDate()
  status: PaymentStatus;
}
