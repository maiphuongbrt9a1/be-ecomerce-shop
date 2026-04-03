import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  productId: bigint;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  userId: bigint;

  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  productVariantId: bigint;

  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  rating: number;

  @ApiProperty({ example: 'Perfect' })
  @IsOptional()
  @IsString()
  comment: string;
}
