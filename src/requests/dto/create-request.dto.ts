import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @ApiProperty({ example: 'return request' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({
    example: 'I want to return this product in order. Because it"s wide',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'PENDING' })
  @IsNotEmpty()
  status: RequestStatus;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
