import { Test, TestingModule } from '@nestjs/testing';
import { SizeProfilesController } from './size-profiles.controller';
import { SizeProfilesService } from './size-profiles.service';

describe('SizeProfilesController', () => {
  let controller: SizeProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SizeProfilesController],
      providers: [SizeProfilesService],
    }).compile();

    controller = module.get<SizeProfilesController>(SizeProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
