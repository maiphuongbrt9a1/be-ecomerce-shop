import { ApiProperty } from '@nestjs/swagger';
import { ProductEntity } from './product.entity';
import { ProductVariantWithMediaEntity } from '@/product-variants/entities/product-variant-with-media.entity';

export class ProductWithVariantsAndMediaEntity extends ProductEntity {
  @ApiProperty({ type: [ProductVariantWithMediaEntity] })
  productVariants: ProductVariantWithMediaEntity[];
}
