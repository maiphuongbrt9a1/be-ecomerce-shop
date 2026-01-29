import { ApiProperty } from '@nestjs/swagger';

export class ColorEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 'Red' })
  name: string;

  @ApiProperty({ example: '#FF0000' })
  hexCode: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
