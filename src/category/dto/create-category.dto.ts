import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'sample name of category' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'description for category' })
  description: string;

  @ApiProperty({ example: 1231 })
  @IsOptional()
  parentId: bigint;

  @ApiProperty({ example: 12314 })
  @IsNotEmpty()
  createByUserId: bigint;

  @ApiProperty({ example: 1325 })
  @IsOptional()
  voucherId: bigint;

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
}
