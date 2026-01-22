import { ApiProperty } from '@nestjs/swagger';
import { VoucherEntity } from './voucher.entity';
import { ProductEntity } from '@/products/entities/product.entity';

export class VoucherWithProductsEntity extends VoucherEntity {
  @ApiProperty({ type: [ProductEntity] })
  voucherForProduct: ProductEntity[];
}
