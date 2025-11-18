import { VoucherStatus } from '@prisma/client';
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserVoucherDto {
  @IsNotEmpty()
  userId: bigint;

  @IsNotEmpty()
  voucherId: bigint;

  @IsOptional()
  @IsDate()
  useVoucherAt: Date;

  @IsOptional()
  @IsDate()
  saveVoucherAt: Date;

  @IsOptional()
  voucherStatus: VoucherStatus;
}
