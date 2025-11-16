import { Module } from '@nestjs/common';
import { UserVouchersService } from './user-vouchers.service';
import { UserVouchersController } from './user-vouchers.controller';

@Module({
  controllers: [UserVouchersController],
  providers: [UserVouchersService],
})
export class UserVouchersModule {}
