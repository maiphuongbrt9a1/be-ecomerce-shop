import { ApiProperty } from '@nestjs/swagger';
import { MediaEntity } from '@/media/entities/media.entity';
import { ProductVariantEntity } from './product-variant.entity';

export class ProductVariantWithMediaEntity extends ProductVariantEntity {
  @ApiProperty({ type: [MediaEntity] })
  media: MediaEntity[];
}
