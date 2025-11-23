import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Order } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  shippingAddressId: bigint;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  userId: bigint;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  processByStaffId: bigint;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  orderDate: Date;

  @ApiProperty({ example: 'PENDING' })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  subTotal: number;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  shippingFee: number;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  discount: number;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
