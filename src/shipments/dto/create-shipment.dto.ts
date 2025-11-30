import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  estimatedDelivery: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deliveredAt: Date;

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  estimatedShipDate: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
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
