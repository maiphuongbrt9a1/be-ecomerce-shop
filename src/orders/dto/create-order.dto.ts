import { OrderStatus } from '@prisma/client';
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  shippingAddressId: bigint;

  @IsNotEmpty()
  userId: bigint;

  @IsNotEmpty()
  processByStaffId: bigint;

  @IsOptional()
  @IsDate()
  orderDate: Date;

  @IsNotEmpty()
  status: OrderStatus;

  @IsNotEmpty()
  @IsNumber()
  subTotal: number;

  @IsNotEmpty()
  @IsNumber()
  shippingFee: number;

  @IsNotEmpty()
  @IsNumber()
  discount: number;

  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
