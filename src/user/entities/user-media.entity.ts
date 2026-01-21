import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';

export class UserMediaEntity {
  @ApiProperty({
    description: 'The unique identifier for the media',
    example: 1,
  })
  id: bigint;

  @ApiProperty({
    description: 'The URL of the media file',
    example: 'https://example.com/media/image.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'The type of media',
    enum: ['IMAGE', 'VIDEO', 'DOCUMENT'],
    example: 'IMAGE',
  })
  type: MediaType;

  @ApiProperty({
    description: 'Whether this media is a shop logo',
    example: false,
  })
  isShopLogo: boolean;

  @ApiProperty({
    description: 'Whether this media is a shop banner',
    example: false,
  })
  isShopBanner: boolean;

  @ApiProperty({
    description: 'Whether this media is a category file',
    example: false,
  })
  isCategoryFile: boolean;

  @ApiProperty({
    description: 'Whether this media is an avatar file',
    example: false,
  })
  isAvatarFile: boolean;

  @ApiProperty({
    description: 'The timestamp when the media was created',
    example: '2025-01-20T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The timestamp when the media was last updated',
    example: '2025-01-20T10:00:00Z',
  })
  updatedAt: Date;
}
