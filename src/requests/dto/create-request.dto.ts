import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus, RequestType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  userId: bigint;

  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  processByStaffId: bigint;

  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  orderId: bigint;

  @ApiProperty({
    example: 'RETURN_REQUEST | CANCEL_REQUEST | CUSTOMER_SUPPORT',
  })
  @IsNotEmpty()
  @IsEnum(RequestType)
  subject: RequestType;

  @ApiProperty({
    example: 'I want to return this product in order. Because it"s wide',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'PENDING' })
  @IsNotEmpty()
  @IsEnum(RequestStatus)
  status: RequestStatus;

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
