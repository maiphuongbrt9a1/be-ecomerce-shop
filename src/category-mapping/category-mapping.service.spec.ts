import { Test, TestingModule } from '@nestjs/testing';
import { CategoryMappingService } from './category-mapping.service';

describe('CategoryMappingService', () => {
  let service: CategoryMappingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryMappingService],
    }).compile();

    service = module.get<CategoryMappingService>(CategoryMappingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
