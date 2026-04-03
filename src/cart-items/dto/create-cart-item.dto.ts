import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCartItemDto {
  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  cartId: bigint;

  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  productVariantId: bigint;

  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  quantity: number;
}
