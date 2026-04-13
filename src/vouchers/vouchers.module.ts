import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [VouchersController],
  providers: [VouchersService],
})
export class VouchersModule {}
