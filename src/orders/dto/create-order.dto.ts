import { ApiProperty } from '@nestjs/swagger';
import { DiscountType, OrderStatus, PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class SecondCreateOrderItemsDto {
  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  productVariantId: bigint;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  unitPrice: number;

  @ApiProperty({
    example: 'free ship',
    description: 'Description of the discount',
  })
  @IsOptional()
  @IsString()
  discountDescription: string;

  @ApiProperty({ example: 'FIXED_AMOUNT' })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 465 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discountValue: number;

  @ApiProperty({
    example: 851,
    description: 'Total price calculated as unitPrice * quantity',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  totalPrice: number;

  @ApiProperty({ example: 'VND' })
  @IsNotEmpty()
  @IsString()
  currencyUnit: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  userId: bigint;

  @ApiProperty({ type: [SecondCreateOrderItemsDto] })
  @IsNotEmpty()
  orderItems: SecondCreateOrderItemsDto[];

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
  })
  @IsNotEmpty()
  @IsString()
  carrier: string;

  @ApiProperty({
    example: 'Ho Xuan Huong Street',
    description:
      'please provide shipping address details. I don"t need address id because i will create new address for this order',
  })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({
    example: 'Dong Hoa',
    description:
      'please provide shipping address details. I don"t need address id because i will create new address for this order',
  })
  @IsNotEmpty()
  @IsString()
  ward: string;

  @ApiProperty({
    example: 'Di An',
    description:
      'please provide shipping address details. I don"t need address id because i will create new address for this order',
  })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({
    example: 'Binh Duong',
    description:
      'please provide shipping address details. I don"t need address id because i will create new address for this order',
  })
  @IsNotEmpty()
  @IsString()
  province: string;

  @ApiProperty({ example: 'ADSAFD797654FDAFD' })
  @IsNotEmpty()
  @IsString()
  zipCode: string;

  @ApiProperty({
    example: 'Binh Duong',
    description:
      'please provide shipping address details. I don"t need address id because i will create new address for this order',
  })
  @IsNotEmpty()
  @IsString()
  country: string;
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
