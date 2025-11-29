import { PartialType } from '@nestjs/swagger';
import { CreateShopOfficeDto } from './create-shop-office.dto';

export class UpdateShopOfficeDto extends PartialType(CreateShopOfficeDto) {}
