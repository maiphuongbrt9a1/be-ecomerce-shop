import { UserEntity } from '@/user/entities/user.entity';
import { ProductEntity } from '@/products/entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ShopOfficeEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 123456, required: false })
  ghnShopId?: bigint;

  @ApiProperty({ example: 202, required: false })
  ghnShopProvinceId?: bigint;

  @ApiProperty({ example: 1542, required: false })
  ghnShopDistrictId?: bigint;

  @ApiProperty({ example: '21012', required: false })
  ghnShopWardCode?: string;

  @ApiProperty({ example: 'Main Store' })
  shopName: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class ShopOfficeWithStaffsEntity extends ShopOfficeEntity {
  @ApiProperty({
    description: 'List of staff members associated with the shop office',
    type: [UserEntity],
  })
  staffs: UserEntity[];
}

export class ShopOfficeWithProductsEntity {
  @ApiProperty({
    description: 'List of products in the shop office',
    type: [ProductEntity],
  })
  products: ProductEntity[];
}

export class GHNShopDetailEntity {
  @ApiProperty({ example: 123456 })
  _id: number;

  @ApiProperty({ example: 'Main Store' })
  name: string;

  @ApiProperty({ example: '0123456789' })
  phone: string;

  @ApiProperty({ example: '123 Main Street' })
  address: string;

  @ApiProperty({ example: '21012' })
  ward_code: string;

  @ApiProperty({ example: 1542 })
  district_id: number;

  @ApiProperty({ example: 100 })
  client_id: number;

  @ApiProperty({ example: 0 })
  bank_account_id: number;

  @ApiProperty({ example: 1, description: 'Shop status in GHN system' })
  status: number;

  @ApiProperty({ example: {}, description: 'Geographic location coordinates' })
  location: object;

  @ApiProperty({ example: '1.0' })
  version_no: string;

  @ApiProperty({ example: false })
  is_created_chat_channel: boolean;

  @ApiProperty({ example: '123 Main Street, Ward, District, City' })
  address_v2: string;

  @ApiProperty({ example: 20101 })
  ward_id_v2: number;

  @ApiProperty({ example: 202 })
  province_id_v2: number;

  @ApiProperty({ example: true })
  is_new_address: boolean;

  @ApiProperty({ example: '192.168.1.1' })
  updated_ip: string;

  @ApiProperty({ example: 0 })
  updated_employee: number;

  @ApiProperty({ example: 100 })
  updated_client: number;

  @ApiProperty({ example: 'web' })
  updated_source: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_date: string;

  @ApiProperty({ example: '192.168.1.1' })
  created_ip: string;

  @ApiProperty({ example: 0 })
  created_employee: number;

  @ApiProperty({ example: 100 })
  created_client: number;

  @ApiProperty({ example: 'web' })
  created_source: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_date: string;
}
