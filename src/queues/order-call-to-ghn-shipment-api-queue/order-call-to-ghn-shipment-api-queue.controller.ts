import { Controller } from '@nestjs/common';
import { OrderCallToGhnShipmentApiQueueService } from './order-call-to-ghn-shipment-api-queue.service';

@Controller('order-call-to-ghn-shipment-api-queue')
export class OrderCallToGhnShipmentApiQueueController {
  constructor(private readonly orderCallToGhnShipmentApiQueueService: OrderCallToGhnShipmentApiQueueService) {}
}
