import { ApiProperty } from '@nestjs/swagger';

export class ShopOfficeEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 'Main Store' })
  shopName: string;
}
