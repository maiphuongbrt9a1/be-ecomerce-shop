import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMediaDto {
  @ApiProperty({
    example:
      'https://i.ytimg.com/vi/yYDE9gMvMbU/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLCn1eyWanaA18fPw7QhCCTftHALFA',
  })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({ example: 'VIDEO | IMAGE | DOCUMENT' })
  @IsNotEmpty()
  type: MediaType;

  @ApiProperty({ example: 851 })
  @IsOptional()
  reviewId: bigint;

  @ApiProperty({ example: 851 })
  @IsOptional()
  userId: bigint;

  @ApiProperty({ example: 851 })
  @IsOptional()
  productVariantId: bigint;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
