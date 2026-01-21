import { ApiProperty } from '@nestjs/swagger';
import { MediaEntity } from '@/media/entities/media.entity';
import { ReviewEntity } from './review.entity';

export class ReviewWithMediaEntity extends ReviewEntity {
  @ApiProperty({ type: [MediaEntity] })
  media: MediaEntity[];
}
