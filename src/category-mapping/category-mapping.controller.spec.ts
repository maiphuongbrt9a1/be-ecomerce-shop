import { Test, TestingModule } from '@nestjs/testing';
import { CategoryMappingController } from './category-mapping.controller';
import { CategoryMappingService } from './category-mapping.service';

describe('CategoryMappingController', () => {
  let controller: CategoryMappingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryMappingController],
      providers: [CategoryMappingService],
    }).compile();

    controller = module.get<CategoryMappingController>(
      CategoryMappingController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
