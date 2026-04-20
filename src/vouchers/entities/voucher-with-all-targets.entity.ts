import { ApiProperty } from '@nestjs/swagger';
import { VoucherEntity } from './voucher.entity';

class VoucherTargetProductEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 'Áo thun nam' })
  name: string;
}

class VoucherTargetCategoryEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 'Áo' })
  name: string;
}

class VoucherTargetVariantEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 'Áo thun nam - Đỏ - XL' })
  variantName: string;

  @ApiProperty({ example: 'XL' })
  variantSize: string;

  @ApiProperty({ example: 3 })
  colorId: number;
}

class VoucherTargetUserVoucherEntity {
  @ApiProperty({ example: 42 })
  userId: bigint;

  @ApiProperty({ example: 'AVAILABLE', enum: ['AVAILABLE', 'SAVED', 'USED', 'EXPIRED'] })
  voucherStatus: string;
}

export class VoucherWithAllTargetsEntity extends VoucherEntity {
  @ApiProperty({ type: [VoucherTargetProductEntity] })
  voucherForProduct: VoucherTargetProductEntity[];

  @ApiProperty({ type: [VoucherTargetCategoryEntity] })
  voucherForCategory: VoucherTargetCategoryEntity[];

  @ApiProperty({ type: [VoucherTargetVariantEntity] })
  voucherForSpecialProductVariant: VoucherTargetVariantEntity[];

  @ApiProperty({ type: [VoucherTargetUserVoucherEntity] })
  userVouchers: VoucherTargetUserVoucherEntity[];
}
