import { Test, TestingModule } from '@nestjs/testing';
import { SizeProfilesService } from './size-profiles.service';

describe('SizeProfilesService', () => {
  let service: SizeProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SizeProfilesService],
    }).compile();

    service = module.get<SizeProfilesService>(SizeProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
