import { ApiProperty } from '@nestjs/swagger';
import { ShipmentStatus } from '@prisma/client';

export class EnrichedPackageDetailEntity {
  @ApiProperty({
    type: 'array',
    items: { type: 'object' },
    description:
      'Product variants in this package with pricing and discount information (ID, name, size, color, SKU, quantity, unitPrice, discountType, discountValue, totalPrice)',
  })
  packageItems: object[];

  @ApiProperty({
    type: 'array',
    items: { type: 'object' },
    description:
      'Package items formatted for GHN create order API request (name, code, quantity, price, length, width, height, weight, category)',
  })
  packageItemsForGHNCreateNewOrderRequest: object[];

  @ApiProperty({
    example: 1500,
    description: 'Total weight of all items in this package in grams',
  })
  totalWeight: number;

  @ApiProperty({
    example: 20,
    description: 'Total height of stacked items in centimeters',
  })
  totalHeight: number;

  @ApiProperty({
    example: 30,
    description: 'Maximum length among all items in centimeters',
  })
  maxLength: number;

  @ApiProperty({
    example: 25,
    description: 'Maximum width among all items in centimeters',
  })
  maxWidth: number;

  @ApiProperty({
    example: 'TP. Hồ Chí Minh',
    description: 'Province name for pickup location from GHN API',
  })
  ghnProvinceName: string;

  @ApiProperty({
    example: 'Quận 1',
    description: 'District name for pickup location from GHN API',
  })
  ghnDistrictName: string;

  @ApiProperty({
    example: 'Phường Bến Nghé',
    description: 'Ward name for pickup location from GHN API',
  })
  ghnWardName: string;

  @ApiProperty({
    description:
      'Selected GHN shipping service details (service_id, short_name like "Express/Standard/Saving", service_type_id, config_fee_id, extra_cost_id, standard_config_fee_id, standard_extra_cost_id)',
  })
  shippingService: object;

  @ApiProperty({
    example: 35000,
    description: 'Calculated shipping fee for this package in VND',
  })
  shippingFee: number;

  @ApiProperty({
    description:
      'Expected delivery time with leadtime (Unix timestamp for delivery) and order_date (Unix timestamp for order creation)',
    example: { leadtime: 1707993600, order_date: 1707917200 },
  })
  expectedDeliveryTime: object;

  @ApiProperty({
    example: 1,
    description: 'GHN district ID for pickup location',
  })
  from_district_id: number;

  @ApiProperty({
    example: '100320',
    description: 'GHN ward code for pickup location',
  })
  from_ward_code: string;

  @ApiProperty({
    example: 3,
    description: 'GHN district ID for delivery location',
  })
  to_district_id: number;

  @ApiProperty({
    example: '100010',
    description: 'GHN ward code for delivery location',
  })
  to_ward_code: string;
}

export class ShipmentEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 1 })
  orderId: bigint;

  @ApiProperty({ example: 1, nullable: true })
  processByStaffId: bigint | null;

  @ApiProperty({ example: 'GHN12345', nullable: true })
  ghnOrderCode: string | null;

  @ApiProperty({
    example: '2024-01-05T00:00:00.000Z',
    description: 'at shop, estimate time when leave from shop',
  })
  estimatedDelivery: Date;

  @ApiProperty({
    example: '2024-01-05T00:00:00.000Z',
    nullable: true,
    description: 'at shop, actual time when leave from shop',
  })
  deliveredAt: Date | null;

  @ApiProperty({
    example: '2024-01-02T00:00:00.000Z',
    description: 'at customer, estimate time when arrive to customer',
  })
  estimatedShipDate: Date;

  @ApiProperty({
    example: '2024-01-02T00:00:00.000Z',
    nullable: true,
    description: 'at customer, actual time when arrive to customer',
  })
  shippedAt: Date | null;

  @ApiProperty({
    examples: ['Giao hàng nhanh'],
    example: 'Giao hàng nhanh',
    description: 'Carrier for the shipment',
  })
  carrier: string;

  @ApiProperty({ example: 'TRACK123456' })
  trackingNumber: string;

  @ApiProperty({ example: 'Shipment description', nullable: true })
  description: string | null;

  @ApiProperty({
    enum: ShipmentStatus,
    example: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
