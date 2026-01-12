import { ApiProperty } from '@nestjs/swagger';

enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export class VoucherEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 'SAVE20' })
  code: string;

  @ApiProperty({ example: '20% off on all items', nullable: true })
  description: string | null;

  @ApiProperty({ enum: DiscountType, example: DiscountType.FIXED_AMOUNT })
  discountType: DiscountType;

  @ApiProperty({ example: 20.0 })
  discountValue: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  validFrom: Date;

  @ApiProperty({ example: '2024-12-31T23:59:59.999Z' })
  validTo: Date;

  @ApiProperty({ example: 100, nullable: true })
  usageLimit: number | null;

  @ApiProperty({ example: 5 })
  timesUsed: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 1 })
  createdBy: bigint;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
