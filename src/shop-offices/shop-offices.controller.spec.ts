import { Test, TestingModule } from '@nestjs/testing';
import { ShopOfficesController } from './shop-offices.controller';
import { ShopOfficesService } from './shop-offices.service';

describe('ShopOfficesController', () => {
  let controller: ShopOfficesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopOfficesController],
      providers: [ShopOfficesService],
    }).compile();

    controller = module.get<ShopOfficesController>(ShopOfficesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
