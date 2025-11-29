import { IsNotEmpty, IsString } from 'class-validator';

export class CreateShopOfficeDto {
  @IsNotEmpty()
  @IsString()
  shopName: string;
}
