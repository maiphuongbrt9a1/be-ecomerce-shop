import { ApiProperty } from '@nestjs/swagger';

enum VoucherStatus {
  AVAILABLE = 'AVAILABLE',
  SAVED = 'SAVED',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
}

export class UserVoucherEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 1 })
  userId: bigint;

  @ApiProperty({ example: 1 })
  voucherId: bigint;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', nullable: true })
  useVoucherAt: Date | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  saveVoucherAt: Date;

  @ApiProperty({ enum: VoucherStatus, example: VoucherStatus.SAVED })
  voucherStatus: VoucherStatus;
}
