import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSizeProfileDto {
  @ApiProperty({ example: 1321546 })
  @IsNotEmpty()
  userId: bigint;

  @ApiProperty({ example: 135.5 })
  @IsOptional()
  @IsNumber()
  heightCm: number;

  @ApiProperty({ example: 85.5 })
  @IsOptional()
  @IsNumber()
  weightKg: number;

  @ApiProperty({ example: 86.5 })
  @IsOptional()
  @IsNumber()
  chestCm: number;

  @ApiProperty({ example: 87.5 })
  @IsOptional()
  @IsNumber()
  hipCm: number;

  @ApiProperty({ example: 112.2 })
  @IsOptional()
  @IsNumber()
  sleeveLengthCm: number;

  @ApiProperty({ example: 86 })
  @IsOptional()
  @IsNumber()
  shoulderLengthCm: number;

  @ApiProperty({ example: 90 })
  @IsOptional()
  @IsNumber()
  inseamCm: number;

  @ApiProperty({ example: 'Body fat' })
  @IsOptional()
  @IsString()
  bodyType: string;

  @ApiProperty({
    example: 'This is profile of John. He like wide t shirt and long trouser',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
