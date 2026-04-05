import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

const toStringArray = ({ value }: { value: unknown }): string[] | undefined => {
  if (value === undefined || value === null || value === '') return undefined;

  const values = Array.isArray(value) ? (value as unknown[]) : [value];
  return values.map((item) => String(item));
};

const toNumberArray = ({ value }: { value: unknown }): number[] | undefined => {
  if (value === undefined || value === null || value === '') return undefined;

  const values = Array.isArray(value) ? value : [value];
  return values.map((item) => Number(item));
};

export class CreateFilterQueryDto {
  @ApiProperty({
    example: 'ao thun',
    description:
      'search text for product variant name. This is used for searching bar on the header of page',
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  searchText?: string;

  @ApiProperty({
    example: ['electronics', 'clothing'],
    description: 'List of categories to filter products by',
  })
  @Transform(toStringArray)
  @IsString({ each: true })
  @Type(() => String)
  @IsOptional()
  categories?: string[];

  @ApiProperty({
    example: [10.0, 100.0],
    description: 'Price range to filter products by',
  })
  @Transform(toNumberArray)
  @IsNumber({}, { each: true })
  @Type(() => Number)
  @IsOptional()
  priceRange?: number[];

  @ApiProperty({
    example: ['red', 'blue'],
    description: 'List of colors to filter products by',
  })
  @Transform(toStringArray)
  @IsString({ each: true })
  @Type(() => String)
  @IsOptional()
  colors?: string[];

  @ApiProperty({
    example: ['S', 'M', 'L'],
    description: 'List of sizes to filter products by',
  })
  @Transform(toStringArray)
  @IsString({ each: true })
  @Type(() => String)
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
  @Transform(toStringArray)
  @IsString({ each: true })
  @Type(() => String)
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
  @Transform(toStringArray)
  @IsString({ each: true })
  @Type(() => String)
  @IsIn(['free_shipping', 'on_sale'], {
    each: true,
    message: 'Feature must be one of free_shipping, on_sale',
  })
  @IsOptional()
  features?: string[];
}
