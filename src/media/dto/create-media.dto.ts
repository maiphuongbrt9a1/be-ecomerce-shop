import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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
  @IsEnum(MediaType)
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

  @ApiProperty({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  isShopLogo: boolean;

  @ApiProperty({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  isShopBanner: boolean;

  @ApiProperty({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  isCategoryFile: boolean;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
