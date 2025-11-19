import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  orderId: bigint;

  @ApiProperty({ example: 'fdsafhdsakjfh56465ewrewr' })
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @ApiProperty({ example: 'COD | VNPAY | MOMO' })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string; // COD, VNPAY, MOMO

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsDate()
  paymentDate: Date;

  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  @IsDate()
  amount: number;

  @ApiProperty({ example: 'PENDING' })
  @IsNotEmpty()
  @IsDate()
  status: PaymentStatus;
}
