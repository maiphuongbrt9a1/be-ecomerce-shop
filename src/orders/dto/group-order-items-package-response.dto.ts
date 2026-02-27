import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';

export class PackageItemDetailForGHNCreateNewOrderRequestDto {
  @ApiProperty({ example: 'T-Shirt Red' })
  name: string;

  @ApiProperty({ example: 'TS-RED-001' })
  code: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 199000 })
  price: number;

  @ApiProperty({ example: 20 })
  length: number;

  @ApiProperty({ example: 15 })
  width: number;

  @ApiProperty({ example: 5 })
  height: number;

  @ApiProperty({ example: 250 })
  weight: number;

  @ApiProperty({
    example: { level1: 'Clothing' },
    description: 'Category mapping for GHN',
  })
  category: {
    level1: string;
  };
}

export class PackageItemDetailDto {
  @ApiProperty({ example: 123 })
  productVariantId: bigint;

  @ApiProperty({ example: 'Nike Shoes' })
  productVariantName: string;

  @ApiProperty({ example: '42' })
  productVariantSize: string;

  @ApiProperty({ example: 'Black' })
  productVariantColor: string;

  @ApiProperty({ example: 'NK-BLK-42' })
  productVariantSKU: string;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 1200000 })
  unitPrice: number;

  @ApiProperty({ example: 'Summer Sale 10%', nullable: true, required: false })
  discountDescription?: string | null;

  @ApiProperty({ enum: DiscountType, example: 'PERCENTAGE', nullable: true })
  discountType: DiscountType | null;

  @ApiProperty({ example: 10 })
  discountValue: number;

  @ApiProperty({ example: 1080000 })
  totalPrice: number;

  @ApiProperty({ example: 'VND' })
  currencyUnit: string;
}

export class GetServiceResponseDto {
  @ApiProperty({ example: 53320 })
  service_id: number;

  @ApiProperty({ example: 'Express' })
  short_name: string;

  @ApiProperty({ example: 2 })
  service_type_id: number;

  @ApiProperty({ example: 'CONFIG_01' })
  config_fee_id: string;

  @ApiProperty({ example: 'EXTRA_01' })
  extra_cost_id: string;

  @ApiProperty({ example: 'STD_CONFIG_01' })
  standard_config_fee_id: string;

  @ApiProperty({ example: 'STD_EXTRA_01' })
  standard_extra_cost_id: string;
}

export class CalculateExpectedDeliveryTimeResponseDto {
  @ApiProperty({ example: 1707993600 })
  leadtime: number;

  @ApiProperty({ example: 1707917200 })
  order_date: number;
}

export class GHNShopDetailDto {
  @ApiProperty({ example: 1001 })
  _id: number;

  @ApiProperty({ example: 'Main Shop' })
  name: string;

  @ApiProperty({ example: '0123456789' })
  phone: string;

  @ApiProperty({ example: '123 Nguyen Hue, District 1' })
  address: string;

  @ApiProperty({ example: '100320' })
  ward_code: string;

  @ApiProperty({ example: 1 })
  district_id: number;

  @ApiProperty({ example: 5001 })
  client_id: number;

  @ApiProperty({ example: 2001 })
  bank_account_id: number;

  @ApiProperty({ example: 1 })
  status: number;

  @ApiProperty({ example: { lat: 10.776, lng: 106.701 } })
  location: object;

  @ApiProperty({ example: '1.0' })
  version_no: string;

  @ApiProperty({ example: true })
  is_created_chat_channel: boolean;

  @ApiProperty({ example: '123 Nguyen Hue, Ward 1, District 1' })
  address_v2: string;

  @ApiProperty({ example: 1001 })
  ward_id_v2: number;

  @ApiProperty({ example: 1 })
  province_id_v2: number;

  @ApiProperty({ example: false })
  is_new_address: boolean;

  @ApiProperty({ example: '127.0.0.1' })
  updated_ip: string;

  @ApiProperty({ example: 10 })
  updated_employee: number;

  @ApiProperty({ example: 5001 })
  updated_client: number;

  @ApiProperty({ example: 'API' })
  updated_source: string;

  @ApiProperty({ example: '2024-01-15' })
  updated_date: string;

  @ApiProperty({ example: '127.0.0.1' })
  created_ip: string;

  @ApiProperty({ example: 10 })
  created_employee: number;

  @ApiProperty({ example: 5001 })
  created_client: number;

  @ApiProperty({ example: 'API' })
  created_source: string;

  @ApiProperty({ example: '2024-01-01' })
  created_date: string;
}

export class PackageDetailDto {
  @ApiProperty({ type: [PackageItemDetailDto] })
  packageItems: PackageItemDetailDto[];

  @ApiProperty({ type: [PackageItemDetailForGHNCreateNewOrderRequestDto] })
  packageItemsForGHNCreateNewOrderRequest: PackageItemDetailForGHNCreateNewOrderRequestDto[];

  @ApiProperty({ example: 1500, description: 'Total weight in grams' })
  totalWeight: number;

  @ApiProperty({ example: 20, description: 'Total height in cm' })
  totalHeight: number;

  @ApiProperty({ example: 30, description: 'Maximum length in cm' })
  maxLength: number;

  @ApiProperty({ example: 25, description: 'Maximum width in cm' })
  maxWidth: number;

  @ApiProperty({ example: 1001 })
  ghnShopId: number;

  @ApiProperty({ type: GHNShopDetailDto })
  ghnShopDetail: GHNShopDetailDto;

  @ApiProperty({ example: 'Ho Chi Minh City' })
  ghnProvinceName: string;

  @ApiProperty({ example: 'District 1' })
  ghnDistrictName: string;

  @ApiProperty({ example: 'Ward 1' })
  ghnWardName: string;

  @ApiProperty({ type: GetServiceResponseDto })
  shippingService: GetServiceResponseDto;

  @ApiProperty({ example: 35000, description: 'Shipping fee in VND' })
  shippingFee: number;

  @ApiProperty({ type: CalculateExpectedDeliveryTimeResponseDto })
  expectedDeliveryTime: CalculateExpectedDeliveryTimeResponseDto;

  @ApiProperty({ example: 1 })
  from_district_id: number;

  @ApiProperty({ example: '100320' })
  from_ward_code: string;

  @ApiProperty({ example: 3 })
  to_district_id: number;

  @ApiProperty({ example: '100010' })
  to_ward_code: string;
}
