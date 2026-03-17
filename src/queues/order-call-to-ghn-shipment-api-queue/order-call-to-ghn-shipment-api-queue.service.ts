import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
import { JobNames, QueueNames } from '../queues.constant';

@Injectable()
export class OrderCallToGhnShipmentApiQueueService {
  constructor(
    @InjectQueue(QueueNames.ORDER_CALL_GHN_SHIPMENT_API_QUEUE)
    private readonly OrderCallToGhnShipmentApiQueue: Queue,
  ) {}

  async addOrderCallToGhnShipmentApiJob(
    data: { userId: string; email: string; name: string },
    opts?: JobsOptions,
  ) {
    // Idempotency via jobId (prevents duplicates)
    const jobId = opts?.jobId ?? `welcome:${data.email}`;
    return this.OrderCallToGhnShipmentApiQueue.add(
      JobNames.ORDER_CALL_GHN_SHIPMENT_API,
      data,
      {
        jobId,
        attempts: 4, // ensure attempts is set on the job so DLQ logic can read it
        backoff: { type: 'exponential', delay: 3000 },
        ...opts,
      },
    );
  }

  async addDelayedOrderCallToGhnShipmentApiJob(
    data: { userId: string; email: string; name: string },
    delayMs: number,
  ) {
    return this.addOrderCallToGhnShipmentApiJob(data, { delay: delayMs });
  }

  async addRepeatableDigest() {
    return this.OrderCallToGhnShipmentApiQueue.add(
      JobNames.ORDER_CALL_GHN_SHIPMENT_API_DIGEST,
      {},
      { repeat: { pattern: '0 9 * * *' } },
    );
  }
}
