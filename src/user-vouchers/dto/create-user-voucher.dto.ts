import { ApiProperty } from '@nestjs/swagger';
import { VoucherStatus } from '@prisma/client';
import { IsDate, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserVoucherDto {
  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  userId: bigint;

  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  voucherId: bigint;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  useVoucherAt: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  saveVoucherAt: Date;

  @ApiProperty({ example: 'AVAILABLE' })
  @IsOptional()
  @IsEnum(VoucherStatus)
  voucherStatus: VoucherStatus;
}
