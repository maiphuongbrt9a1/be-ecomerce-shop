import { ApiProperty } from '@nestjs/swagger';

export class AddressEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 1, nullable: true })
  userId: bigint | null;

  @ApiProperty({ example: '123 Main Street' })
  street: string;

  @ApiProperty({ example: 'Ward 1' })
  ward: string;

  @ApiProperty({ example: 'District 1' })
  district: string;

  @ApiProperty({ example: 'Ho Chi Minh City' })
  province: string;

  @ApiProperty({ example: '70000' })
  zipCode: string;

  @ApiProperty({ example: 'Vietnam' })
  country: string;

  @ApiProperty({ example: 1, nullable: true })
  shopOfficeId: bigint | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
