import { ApiProperty } from '@nestjs/swagger';

export class UserOrderStatsEntity {
  @ApiProperty({
    example: 24,
    description: 'Total number of orders the user has ever placed',
  })
  orderCount: number;

  @ApiProperty({
    example: 18,
    description:
      'Number of orders the user has received — status COMPLETED or DELIVERED',
  })
  completedCount: number;

  @ApiProperty({
    example: 2,
    description: 'Number of orders the user cancelled — status CANCELLED',
  })
  cancelledCount: number;

  @ApiProperty({
    example: 5_240_000,
    description:
      'Sum of totalAmount across the user\'s orders (in VND). Includes every status — matches the FE legacy semantics.',
  })
  totalSpend: number;
}
