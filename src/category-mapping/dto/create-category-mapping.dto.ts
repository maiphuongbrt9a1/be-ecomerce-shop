import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCategoryMappingDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 1231, description: 'base category id' })
  baseCategoryId: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 4567, description: 'suggest category id' })
  suggestCategoryId: number;
}
