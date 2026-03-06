import { ApiProperty } from '@nestjs/swagger';
import { ProductEntity } from './product.entity';
import { ProductVariantWithMediaEntity } from '@/product-variants/entities/product-variant-with-media.entity';
import { MediaEntity } from '@/media/entities/media.entity';

export class ProductWithVariantsAndMediaEntity extends ProductEntity {
  @ApiProperty({
    type: [MediaEntity],
    description: 'Media files associated with the product (avatar/images)',
  })
  media: MediaEntity[];

  @ApiProperty({
    type: [ProductVariantWithMediaEntity],
    description:
      'Product variants (size/color combinations) with their media files',
  })
  productVariants: ProductVariantWithMediaEntity[];
}
