import { ApiProperty } from '@nestjs/swagger';
import { VoucherEntity } from '@/vouchers/entities/voucher.entity';
import { UserVoucherEntity } from './user-voucher.entity';

export class UserSavedVoucherDetailEntity extends UserVoucherEntity {
  @ApiProperty({ type: VoucherEntity })
  voucher: VoucherEntity;
}
