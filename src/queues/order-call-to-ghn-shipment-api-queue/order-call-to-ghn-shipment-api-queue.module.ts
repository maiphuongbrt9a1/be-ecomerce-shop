import { Module } from '@nestjs/common';
import { OrderCallToGhnShipmentApiQueueService } from './order-call-to-ghn-shipment-api-queue.service';
import { OrderCallToGhnShipmentApiQueueController } from './order-call-to-ghn-shipment-api-queue.controller';
import { BullModule } from '@nestjs/bullmq';
import { QueueNames } from '../queues.constant';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueNames.ORDER_CALL_GHN_SHIPMENT_API_QUEUE,
      // per-queue defaults (can override root defaults)
      defaultJobOptions: {
        attempts: 4,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: { age: 1800, count: 500 },
        removeOnFail: { age: 24 * 3600, count: 1000 },
      },
    }),
    BullModule.registerQueue({
      name: QueueNames.ORDER_CALL_GHN_SHIPMENT_API_DLQ,
      defaultJobOptions: {
        removeOnComplete: true,
      },
    }),
  ],
  controllers: [OrderCallToGhnShipmentApiQueueController],
  providers: [
    OrderCallToGhnShipmentApiQueueService,
    GHNShipmentProcessor,
    GHNShipmentDLQProcessor,
  ],
  exports: [OrderCallToGhnShipmentApiQueueService],
})
export class OrderCallToGhnShipmentApiQueueModule {}
