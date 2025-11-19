import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

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
  quantity: number;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
