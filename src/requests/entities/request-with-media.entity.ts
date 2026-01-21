import { ApiProperty } from '@nestjs/swagger';
import { UserWithMediaEntity } from '@/user/entities/user-with-media.entity';
import { MediaEntity } from '@/media/entities/media.entity';
import { RequestEntity } from './request.entity';

export class RequestWithMediaEntity extends RequestEntity {
  @ApiProperty({ type: [MediaEntity] })
  media: MediaEntity[];

  @ApiProperty({ type: UserWithMediaEntity })
  processByStaff: UserWithMediaEntity;
}
