import { ApiProperty } from '@nestjs/swagger';

export class CategoryMappingEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  baseCategoryId: bigint;

  @ApiProperty({ example: 2 })
  suggestCategoryId: bigint;
}
