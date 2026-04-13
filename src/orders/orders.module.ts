import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PaymentsModule } from '@/payments/payments.module';
import { ShipmentsModule } from '@/shipments/shipments.module';
import { AwsS3Module } from '@/aws-s3/aws-s3.module';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [PaymentsModule, ShipmentsModule, AwsS3Module, NotificationModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
