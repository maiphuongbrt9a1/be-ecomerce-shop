import { MediaType } from '@prisma/client';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMediaDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  type: MediaType;

  @IsOptional()
  reviewId: bigint;

  @IsOptional()
  userId: bigint;

  @IsOptional()
  productVariantId: bigint;

  @IsOptional()
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
