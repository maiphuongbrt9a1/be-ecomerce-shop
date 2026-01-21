import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'Sample product name' })
  name: string;

  @ApiProperty({ example: 'Sample product description' })
  @IsOptional()
  description: string;

  @IsNotEmpty()
  @ApiProperty({ example: 12 })
  @Type(() => Number)
  price: number;

  @IsNotEmpty()
  @ApiProperty({ example: 'ADSFDSAF1463218FA' })
  stockKeepingUnit: string;

  @IsNotEmpty()
  @ApiProperty({ example: 25 })
  @Type(() => Number)
  stock: number;

  @IsNotEmpty()
  @ApiProperty({ example: 1231 })
  createByUserId: bigint;

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

  @ApiProperty({ example: 1325 })
  @IsOptional()
  categoryId: bigint;

  @ApiProperty({ example: 1325 })
  @IsOptional()
  voucherId: bigint;

  @ApiProperty({ example: 1325 })
  @IsOptional()
  shopOfficeId: bigint;
}

export class CreateProductWithFileDto extends CreateProductDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Files array to upload',
  })
  @IsNotEmpty()
  files: Express.Multer.File[];
}
