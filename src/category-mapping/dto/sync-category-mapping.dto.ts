import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';

export class SyncCategoryMappingDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 3, description: 'base category id to sync' })
  baseCategoryId: number;

  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @ApiProperty({
    example: [4, 5, 7],
    description:
      'full set of suggest category ids that should remain mapped to the base; anything not in this list will be removed',
    type: [Number],
  })
  suggestCategoryIds: number[];

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    required: false,
    description:
      'when true, the reverse mappings (each suggest -> base) are also synced atomically',
  })
  symmetric?: boolean;
}
