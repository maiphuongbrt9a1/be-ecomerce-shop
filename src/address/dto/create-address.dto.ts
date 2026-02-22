import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  userId: bigint;

  @ApiProperty({ example: 'Ho Xuan Huong Street' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ example: 'Đông Hòa' })
  @IsNotEmpty()
  @IsString()
  ward: string;

  @ApiProperty({ example: 'Dĩ An' })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({ example: 'Bình Dương' })
  @IsNotEmpty()
  @IsString()
  province: string;

  @ApiProperty({ example: 'ADSAFD797654FDAFD' })
  @IsNotEmpty()
  @IsString()
  zipCode: string;

  @ApiProperty({ example: 'Bình Dương' })
  @IsNotEmpty()
  @IsString()
  country: string;

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
