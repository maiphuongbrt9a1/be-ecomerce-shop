import { Test, TestingModule } from '@nestjs/testing';
import { OrderCallToGhnShipmentApiQueueController } from './order-call-to-ghn-shipment-api-queue.controller';
import { OrderCallToGhnShipmentApiQueueService } from './order-call-to-ghn-shipment-api-queue.service';

describe('OrderCallToGhnShipmentApiQueueController', () => {
  let controller: OrderCallToGhnShipmentApiQueueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderCallToGhnShipmentApiQueueController],
      providers: [OrderCallToGhnShipmentApiQueueService],
    }).compile();

    controller = module.get<OrderCallToGhnShipmentApiQueueController>(OrderCallToGhnShipmentApiQueueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
