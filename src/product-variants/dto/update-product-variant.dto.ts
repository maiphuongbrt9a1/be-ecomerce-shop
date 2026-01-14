import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductVariantDto } from './create-product-variant.dto';
import { IsArray, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class UpdateProductVariantDto extends PartialType(
  CreateProductVariantDto,
) {
  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'int64', example: '9007199254740993' },
    description:
      'Array of media ids to delete from the product variant. Represent big integers as strings.',
    example: ['9007199254740993', '9007199254740994'],
  })
  @IsOptional()
  @IsArray()
  @Transform(
    ({ value }) => {
      if (value === undefined || value === null) return undefined;

      // already an array -> map to BigInt
      if (Array.isArray(value)) {
        return value.map((v) => {
          if (typeof v === 'bigint') return v;
          if (typeof v === 'number') return BigInt(v);
          return BigInt(String(v));
        });
      }

      // string input: try JSON.parse (e.g. "[59,60]") or comma-separated ("59,60")
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.startsWith('[')) {
          try {
            const parsed: any = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              return parsed.map((v) => BigInt(v));
            }
          } catch {
            // fallthrough to comma split
            throw new BadRequestException(
              'mediaIdsToDelete must be an array of big integers or a stringified array',
            );
          }
        }
        // comma separated or single scalar string
        const parts = trimmed
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (parts.length === 0) return [];
        return parts.map((p) => BigInt(p));
      }

      // scalar non-string (number, bigint, etc.)
      return [BigInt(value as any)];
    },
    { toClassOnly: true },
  )
  mediaIdsToDelete?: bigint[];
}
