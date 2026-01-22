import { ApiProperty } from '@nestjs/swagger';
import { VoucherEntity } from './voucher.entity';
import { ProductVariantEntity } from '@/product-variants/entities/product-variant.entity';

export class VoucherWithProductVariantsEntity extends VoucherEntity {
  @ApiProperty({ type: [ProductVariantEntity] })
  voucherForSpecialProductVariant: ProductVariantEntity[];
}
