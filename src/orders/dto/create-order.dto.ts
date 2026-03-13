import type {
  createNewAddressForOrderResponseDto,
  PackagesForShipping,
} from '@/helpers/types/types';
import { CreateAddressForOrderResponseDto } from '@/address/dto/create-address-for-order-response.dto';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PackageDetailDto } from './group-order-items-package-response.dto';

export class SecondCreateOrderItemsDto {
  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  productVariantId: bigint;

  @ApiProperty({ example: 8 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  userId: bigint;

  @ApiProperty({
    enumName: 'PaymentMethod',
    examples: [
      'COD',
      'VNPAY',
      'MOMO',
      'ZALOPAY',
      'CREDIT_CARD',
      'BANK_TRANSFER',
    ],
    example: 'COD',
    description: 'Payment method for the order',
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    examples: [
      'Giao hàng nhanh',
      'Giao hàng tiết kiệm',
      'GrabExpress',
      'VNPost',
      'J&T Express',
    ],
    description: 'Carrier for the shipment',
    example: 'Giao hàng nhanh',
  })
  @IsNotEmpty()
  @IsString()
  carrier: string;

  @ApiProperty({
    example: 'This is a description of the order',
    description: 'Description of the order',
    required: false,
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ example: '0987654321' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    description:
      'Validated shipping address for order creation (database address plus GHN location data).',
    type: CreateAddressForOrderResponseDto,
  })
  @IsNotEmpty()
  shippingAddress: createNewAddressForOrderResponseDto;

  @ApiProperty({
    description:
      'Packages grouped by GHN shop ID. Each key is a shop ID string and each value is a PackageDetail object.',
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath(PackageDetailDto),
    },
  })
  @IsNotEmpty()
  packages: PackagesForShipping;
}

export class SecondCreateOrderDto {
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
  @Type(() => Date)
  orderDate: Date;

  @ApiProperty({ example: 'PENDING' })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  subTotal: number;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  shippingFee: number;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  discount: number;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  totalAmount: number;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
