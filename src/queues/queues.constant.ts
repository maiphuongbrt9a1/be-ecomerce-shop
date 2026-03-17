export enum QueueNames {
  ORDER_CALL_GHN_SHIPMENT_API_QUEUE = 'order-call-ghn-shipment-api-queue',
  ORDER_CALL_GHN_SHIPMENT_API_DLQ = 'order-call-ghn-shipment-api-dlq', // Dead Letter Queue
}

export const JobNames = {
  ORDER_CALL_GHN_SHIPMENT_API: 'order-call-ghn-shipment-api',
  ORDER_CALL_GHN_SHIPMENT_API_DIGEST: 'order-call-ghn-shipment-digest',
  DEAD_LETTER: 'dead-letter',
};
