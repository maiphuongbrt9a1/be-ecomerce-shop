import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSizeProfileDto {
  @IsNotEmpty()
  userId: bigint;

  @IsOptional()
  @IsNumber()
  heightCm: number;

  @IsOptional()
  @IsNumber()
  weightKg: number;

  @IsOptional()
  @IsNumber()
  chestCm: number;

  @IsOptional()
  @IsNumber()
  hipCm: number;

  @IsOptional()
  @IsNumber()
  sleeveLengthCm: number;

  @IsOptional()
  @IsNumber()
  shoulderLengthCm: number;

  @IsOptional()
  @IsNumber()
  inseamCm: number;

  @IsOptional()
  @IsString()
  bodyType: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
