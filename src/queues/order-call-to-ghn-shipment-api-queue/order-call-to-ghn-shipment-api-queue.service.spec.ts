import { Test, TestingModule } from '@nestjs/testing';
import { OrderCallToGhnShipmentApiQueueService } from './order-call-to-ghn-shipment-api-queue.service';

describe('OrderCallToGhnShipmentApiQueueService', () => {
  let service: OrderCallToGhnShipmentApiQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderCallToGhnShipmentApiQueueService],
    }).compile();

    service = module.get<OrderCallToGhnShipmentApiQueueService>(OrderCallToGhnShipmentApiQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
