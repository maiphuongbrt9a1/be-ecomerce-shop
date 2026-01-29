import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  orderId: bigint;

  @ApiProperty({ example: 'fdsafhdsakjfh56465ewrewr' })
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @ApiProperty({
    enum: PaymentMethod,
    enumName: 'PaymentMethod',
    examples: [
      'COD',
      'VNPAY',
      'MOMO',
      'ZALOPAY',
      'CREDIT_CARD',
      'BANK_TRANSFER',
    ],
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  paymentDate: Date;

  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 'VND' })
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  currencyUnit: string;

  @ApiProperty({ example: 'PENDING' })
  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}
