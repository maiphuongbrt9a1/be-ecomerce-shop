import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsArray, IsOptional } from 'class-validator';
import { TransformMediaIdsToDeleteArrayFromStringArrayToBigintArray } from '@/decorator/customize';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'int64', example: '9007199254740993' },
    description:
      'Array of media ids to delete from the product variant. Represent big integers as strings.',
    example: ['9007199254740993', '9007199254740994'],
  })
  @IsOptional()
  @IsArray()
  @TransformMediaIdsToDeleteArrayFromStringArrayToBigintArray()
  mediaIdsToDelete?: bigint[];
}
