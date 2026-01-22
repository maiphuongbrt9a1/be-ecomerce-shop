import { ApiProperty } from '@nestjs/swagger';
import { VoucherEntity } from './voucher.entity';
import { CategoryEntity } from '@/category/entities/category.entity';

export class VoucherWithCategoriesEntity extends VoucherEntity {
  @ApiProperty({ type: [CategoryEntity] })
  voucherForCategory: CategoryEntity[];
}
