import { UserEntity } from '@/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ShopOfficeEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 'Main Store' })
  shopName: string;
}

export class ShopOfficeWithStaffsEntity extends ShopOfficeEntity {
  @ApiProperty({
    description: 'List of staff members associated with the shop office',
    type: [UserEntity],
  })
  staffs: UserEntity[];
}
