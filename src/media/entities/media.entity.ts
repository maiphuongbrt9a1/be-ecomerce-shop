import { ApiProperty } from '@nestjs/swagger';

enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

export class MediaEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/file.jpg' })
  url: string;

  @ApiProperty({ enum: MediaType, example: MediaType.IMAGE })
  type: MediaType;

  @ApiProperty({ example: 1, nullable: true })
  reviewId: bigint | null;

  @ApiProperty({ example: 1, nullable: true })
  userId: bigint | null;

  @ApiProperty({ example: 1, nullable: true })
  productVariantId: bigint | null;

  @ApiProperty({ example: false })
  isShopLogo: boolean;

  @ApiProperty({ example: false })
  isShopBanner: boolean;

  @ApiProperty({ example: false })
  isCategoryFile: boolean;

  @ApiProperty({ example: false })
  isAvatarFile: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
