import { ApiProperty } from '@nestjs/swagger';
import { CartItemEntity } from './cart-item.entity';
import { ProductVariantWithMediaEntity } from '@/product-variants/entities/product-variant-with-media.entity';

export class CartItemWithVariantEntity extends CartItemEntity {
  @ApiProperty({ type: ProductVariantWithMediaEntity })
  productVariant: ProductVariantWithMediaEntity;
}
