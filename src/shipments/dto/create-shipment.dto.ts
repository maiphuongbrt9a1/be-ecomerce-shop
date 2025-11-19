import { ApiProperty } from '@nestjs/swagger';
import { ShipmentStatus } from '@prisma/client';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateShipmentDto {
  @ApiProperty({ example: 455 })
  @IsNotEmpty()
  orderId: bigint;

  @ApiProperty({ example: 455 })
  @IsNotEmpty()
  processByStaffId: bigint;

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsDate()
  estimatedDelivery: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  deliveredAt: Date;

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsDate()
  estimatedShipDate: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  shippedAt: Date;

  @ApiProperty({ example: 'Important and quick' })
  @IsNotEmpty()
  @IsString()
  carrier: string;

  @ApiProperty({ example: 'kjhkjdsfhds65442324sdfds' })
  @IsNotEmpty()
  @IsString()
  trackingNumber: string;

  @ApiProperty({ example: 'PENDING' })
  @IsNotEmpty()
  status: ShipmentStatus;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
