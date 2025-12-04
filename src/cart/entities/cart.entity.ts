import { ApiProperty } from '@nestjs/swagger';

export class CartEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 1 })
  userId: bigint;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
