import {
  IsDataURI,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  productId: bigint;

  @IsNotEmpty()
  userId: bigint;

  @IsNotEmpty()
  productVariantId: bigint;

  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @IsOptional()
  @IsString()
  comment: string;

  @IsOptional()
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
