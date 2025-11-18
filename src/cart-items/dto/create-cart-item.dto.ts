import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCartItemDto {
  @IsNotEmpty()
  cartId: bigint;

  @IsNotEmpty()
  productVariantId: bigint;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
