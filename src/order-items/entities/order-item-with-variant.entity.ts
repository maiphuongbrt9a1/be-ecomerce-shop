import { ApiProperty } from '@nestjs/swagger';
import { ProductVariantWithMediaEntity } from '@/product-variants/entities/product-variant-with-media.entity';
import { OrderItemEntity } from './order-item.entity';

export class OrderItemWithVariantEntity extends OrderItemEntity {
  @ApiProperty({ type: ProductVariantWithMediaEntity })
  productVariant: ProductVariantWithMediaEntity;
}
