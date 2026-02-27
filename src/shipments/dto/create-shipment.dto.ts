import type {
  createNewAddressForOrderResponseDto,
  PackagesForShipping,
} from '@/helpers/types/types';
import { CreateAddressForOrderResponseDto } from '@/address/dto/create-address-for-order-response.dto';
import { PackageDetailDto } from '@/orders/dto/group-order-items-package-response.dto';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ShipmentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateShipmentDto {
  @ApiProperty({ example: 455 })
  @IsNotEmpty()
  orderId: bigint;

  @ApiProperty({ example: 455 })
  @IsNotEmpty()
  processByStaffId: bigint;

  @ApiProperty({
    example: new Date(),
    description: 'at shop, estimate time when leave from shop',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  estimatedDelivery: Date;

  @ApiProperty({
    example: new Date(),
    description: 'at shop, actual time when leave from shop',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deliveredAt: Date;

  @ApiProperty({
    example: new Date(),
    description: 'at customer, estimate time when arrive to customer',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  estimatedShipDate: Date;

  @ApiProperty({
    example: new Date(),
    description: 'at customer, actual time when arrive to customer',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  shippedAt: Date;

  @ApiProperty({
    examples: [
      'Giao hàng nhanh',
      'Giao hàng tiết kiệm',
      'GrabExpress',
      'VNPost',
      'J&T Express',
    ],
    example: 'Giao hàng nhanh',
    description: 'Carrier for the shipment',
  })
  @IsNotEmpty()
  @IsString()
  carrier: string;

  @ApiProperty({ example: 'ABC123XYZ' })
  @IsNotEmpty()
  @IsString()
  trackingNumber: string;

  @ApiProperty({ example: 'PENDING' })
  @IsNotEmpty()
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

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

export class createNewShipmentForOrderAndAutoCreateGHNShipmentDto {
  @ApiProperty({ example: 455 })
  @IsNotEmpty()
  orderId: bigint;

  @ApiProperty({
    examples: [
      'Giao hàng nhanh',
      'Giao hàng tiết kiệm',
      'GrabExpress',
      'VNPost',
      'J&T Express',
    ],
    example: 'Giao hàng nhanh',
    description: 'Carrier for the shipment',
  })
  @IsNotEmpty()
  @IsString()
  carrier: string;

  @ApiProperty({
    description:
      'Packages grouped by GHN shop ID. Each key is a shop ID string and each value is a PackageDetail object.',
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath(PackageDetailDto),
    },
  })
  packages: PackagesForShipping;

  @ApiProperty({
    description:
      'Validated shipping address for GHN shipment creation (database address plus GHN location data).',
    type: CreateAddressForOrderResponseDto,
  })
  createNewAddressForOrderResponseDto: createNewAddressForOrderResponseDto;

  @ApiProperty({
    example: '0987654321',
    description: 'Customer phone number for GHN order creation',
  })
  customerPhoneForOrder: string;
}

export class PreviewShippingFeeForPackagesDto {
  @ApiProperty({
    description:
      'Packages grouped by GHN shop ID. Each key is a shop ID string and each value is a PackageDetail object containing product variants, dimensions, and weights.',
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath(PackageDetailDto),
    },
  })
  packages: PackagesForShipping;

  @ApiProperty({
    description:
      'Validated shipping address for GHN fee calculation (database address plus GHN location data with province, district, and ward IDs).',
    type: CreateAddressForOrderResponseDto,
  })
  createNewAddressForOrderResponseDto: createNewAddressForOrderResponseDto;
}
