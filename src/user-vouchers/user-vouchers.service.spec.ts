import { Test, TestingModule } from '@nestjs/testing';
import { UserVouchersService } from './user-vouchers.service';

describe('UserVouchersService', () => {
  let service: UserVouchersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserVouchersService],
    }).compile();

    service = module.get<UserVouchersService>(UserVouchersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
