import { Test, TestingModule } from '@nestjs/testing';
import { ShopOfficesService } from './shop-offices.service';

describe('ShopOfficesService', () => {
  let service: ShopOfficesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopOfficesService],
    }).compile();

    service = module.get<ShopOfficesService>(ShopOfficesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
