import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductVariantDto {
  @IsNotEmpty()
  productId: bigint;

  @IsNotEmpty()
  createByUserId: bigint;

  @IsString()
  @IsNotEmpty()
  variantName: string;

  @IsString()
  @IsNotEmpty()
  variantColor: string;

  @IsString()
  @IsNotEmpty()
  variantSize: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @IsString()
  @IsNotEmpty()
  stockKeepingUnit: string;

  @IsOptional()
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
