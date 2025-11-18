import { Module } from '@nestjs/common';
import { UserVouchersService } from './user-vouchers.service';
import { UserVouchersController } from './user-vouchers.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [UserVouchersController],
  providers: [UserVouchersService, PrismaService],
})
export class UserVouchersModule {}
