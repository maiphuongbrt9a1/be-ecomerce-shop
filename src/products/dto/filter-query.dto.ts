import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFilterQueryDto {
  @ApiProperty({
    example: 'ao thun',
    description:
      'search text for product variant name. This is used for searching bar on the header of page',
  })
  @IsString()
  @IsOptional()
  searchText?: string;

  @ApiProperty({
    example: ['electronics', 'clothing'],
    description: 'List of categories to filter products by',
  })
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @ApiProperty({
    example: [10.0, 100.0],
    description: 'Price range to filter products by',
  })
  @IsNumber({}, { each: true })
  @IsOptional()
  priceRange?: number[];

  @ApiProperty({
    example: ['red', 'blue'],
    description: 'List of colors to filter products by',
  })
  @IsString({ each: true })
  @IsOptional()
  colors?: string[];

  @ApiProperty({
    example: ['S', 'M', 'L'],
    description: 'List of sizes to filter products by',
  })
  @IsString({ each: true })
  @IsOptional()
  @IsIn(['S', 'M', 'L', 'XL', 'XXL'], {
    each: true,
    message: 'Size must be one of S, M, L, XL, XXL',
  })
  sizes?: string[];

  @ApiProperty({
    example: ['new', 'used', 'best_selling'],
    description: 'List of conditions to filter products by',
  })
  @IsString({ each: true })
  @IsOptional()
  @IsIn(['new', 'used', 'best_selling'], {
    each: true,
    message: 'Condition must be one of new, used, best_selling',
  })
  conditions?: string[];

  @ApiProperty({
    example: ['free_shipping', 'on_sale'],
    description: 'List of features to filter products by',
  })
  @IsString({ each: true })
  @IsIn(['free_shipping', 'on_sale'], {
    each: true,
    message: 'Feature must be one of free_shipping, on_sale',
  })
  @IsOptional()
  features?: string[];
}
