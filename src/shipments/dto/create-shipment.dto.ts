import { ShipmentStatus } from '@prisma/client';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateShipmentDto {
  @IsNotEmpty()
  orderId: bigint;

  @IsNotEmpty()
  processByStaffId: bigint;

  @IsNotEmpty()
  @IsDate()
  estimatedDelivery: Date;

  @IsOptional()
  @IsDate()
  deliveredAt: Date;

  @IsNotEmpty()
  @IsDate()
  estimatedShipDate: Date;

  @IsOptional()
  @IsDate()
  shippedAt: Date;

  @IsNotEmpty()
  @IsString()
  carrier: string;

  @IsNotEmpty()
  @IsString()
  trackingNumber: string;

  @IsNotEmpty()
  status: ShipmentStatus;

  @IsOptional()
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
