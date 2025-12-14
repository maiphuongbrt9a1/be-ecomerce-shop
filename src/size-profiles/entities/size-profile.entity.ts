import { ApiProperty } from '@nestjs/swagger';

export class SizeProfileEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 1 })
  userId: bigint;

  @ApiProperty({ example: 175.5, nullable: true })
  heightCm: number | null;

  @ApiProperty({ example: 70.0, nullable: true })
  weightKg: number | null;

  @ApiProperty({ example: 95.0, nullable: true })
  chestCm: number | null;

  @ApiProperty({ example: 90.0, nullable: true })
  hipCm: number | null;

  @ApiProperty({ example: 60.0, nullable: true })
  sleeveLengthCm: number | null;

  @ApiProperty({ example: 80.0, nullable: true })
  inseamCm: number | null;

  @ApiProperty({ example: 45.0, nullable: true })
  shoulderLengthCm: number | null;

  @ApiProperty({ example: 'Athletic', nullable: true })
  bodyType: string | null;

  @ApiProperty({ example: 'Regular fit preferred', nullable: true })
  description: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
