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
  ValidateNested,
} from 'class-validator';
import type { PackagesForShipping } from '@/helpers/types/types';
import { PreviewPackageDetailWithChecksumDto } from '@/shipments/dto/preview-shipping-fee-for-order.dto';

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
    examples: ['COD', 'VNPAY'],
    example: 'COD',
    description: 'Payment method for the order',
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    examples: ['Giao hàng nhanh'],
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
  @ValidateNested()
  @Type(() => CreateAddressForOrderResponseDto)
  shippingAddress: CreateAddressForOrderResponseDto;

  @ApiProperty({
    description:
      'Packages grouped by GHN shop ID. Each key is a shop ID string and each value is a PackageDetail object.',
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath(PreviewPackageDetailWithChecksumDto),
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
}
