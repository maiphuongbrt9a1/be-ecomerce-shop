import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateShopOfficeDto {
  @ApiProperty({ example: 'Văn phòng Hà Nội', required: true })
  @IsNotEmpty()
  @IsString()
  shopName: string;

  @ApiProperty({
    example: 'Đường Hồ Xuân Hương, Đông Hòa, Dĩ An, Bình Dương, Việt Nam',
    description:
      'please provide shipping address details. This is full address of shop office',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: 'Ho Xuan Huong Street' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({
    example: 'Đông Hòa',
    description: 'please provide shipping address details.',
  })
  @IsNotEmpty()
  @IsString()
  ward: string;

  @ApiProperty({
    example: 'Dĩ An',
    description: 'please provide shipping address details.',
  })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({
    example: 'Bình Dương',
    description: 'please provide shipping address details.',
  })
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

  @ApiProperty({ example: '0987654321' })
  @IsNotEmpty()
  @IsString()
  phone: string;
}
