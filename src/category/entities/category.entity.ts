import { ApiProperty } from '@nestjs/swagger';

export class CategoryEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiProperty({
    example: 'Electronic devices and accessories',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ example: 1, nullable: true })
  parentId: bigint | null;

  @ApiProperty({ example: 1 })
  createByUserId: bigint;

  @ApiProperty({ example: 1, nullable: true })
  voucherId: bigint | null;

  @ApiProperty({ example: 1, nullable: true })
  shopOfficeId: bigint | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
