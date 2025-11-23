import { Module } from '@nestjs/common';
import { ShopOfficesService } from './shop-offices.service';
import { ShopOfficesController } from './shop-offices.controller';

@Module({
  controllers: [ShopOfficesController],
  providers: [ShopOfficesService],
})
export class ShopOfficesModule {}
