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

export class GhnProvinceEntity {
  @ApiProperty({ example: 202 })
  ProvinceID: number;

  @ApiProperty({ example: 'Bình Dương' })
  ProvinceName: string;

  @ApiProperty({ example: 1 })
  CountryID: number;

  @ApiProperty({ example: 'BD' })
  Code: string;

  @ApiProperty({ example: ['Bình Dương', 'Binh Duong'], isArray: true })
  NameExtension: string[];

  @ApiProperty({ example: 1 })
  RegionID: number;

  @ApiProperty({ example: 0 })
  RegionCPN: number;

  @ApiProperty({ example: 1 })
  IsEnable: number;

  @ApiProperty({ example: 0 })
  UpdatedBy: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  CreatedAt: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  UpdatedAt: string;

  @ApiProperty({ example: 1, description: '1: Unlock, 2: Lock' })
  Status: number;

  @ApiProperty({ example: '192.168.1.1' })
  UpdatedIP: string;

  @ApiProperty({ example: 0 })
  UpdatedEmployee: number;

  @ApiProperty({ example: 'web' })
  UpdatedSource: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  UpdatedDate: string;
}

export class GhnDistrictEntity {
  @ApiProperty({ example: 1542 })
  DistrictID: number;

  @ApiProperty({ example: 202 })
  ProvinceID: number;

  @ApiProperty({ example: 'Dĩ An' })
  DistrictName: string;

  @ApiProperty({ example: 'DA' })
  Code: string;

  @ApiProperty({ example: 1 })
  Type: number;

  @ApiProperty({ example: 3 })
  SupportType: number;

  @ApiProperty({ example: ['Dĩ An', 'Di An'], isArray: true })
  NameExtension: string[];

  @ApiProperty({ example: true })
  CanUpdateCOD: boolean;

  @ApiProperty({ example: 0 })
  PickType: number;

  @ApiProperty({ example: 0 })
  DeliverType: number;

  @ApiProperty({ example: '' })
  ReasonCode: string;

  @ApiProperty({ example: '' })
  ReasonMessage: string;

  @ApiProperty({ required: false })
  OnDates: unknown;

  @ApiProperty({
    example: { From: null, To: null, Return: null },
  })
  WhiteListClient: {
    From: unknown;
    To: unknown;
    Return: unknown;
  };

  @ApiProperty({
    example: { From: null, To: null },
  })
  WhiteListWard: {
    From: unknown;
    To: unknown;
  };

  @ApiProperty({ example: 1 })
  IsEnable: number;

  @ApiProperty({ example: 0 })
  UpdatedBy: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  CreatedAt: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  UpdatedAt: string;

  @ApiProperty({ example: 1, description: '1: Unlock, 2: Lock' })
  Status: number;

  @ApiProperty({ example: '192.168.1.1' })
  UpdatedIP: string;

  @ApiProperty({ example: 0 })
  UpdatedEmployee: number;

  @ApiProperty({ example: 'web' })
  UpdatedSource: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  UpdatedDate: string;
}

export class GhnWardEntity {
  @ApiProperty({ example: '21012' })
  WardCode: string;

  @ApiProperty({ example: 1542 })
  DistrictID: number;

  @ApiProperty({ example: 'Đông Hòa' })
  WardName: string;

  @ApiProperty({ example: ['Đông Hòa', 'Dong Hoa'], isArray: true })
  NameExtension: string[];

  @ApiProperty({ example: true })
  CanUpdateCOD: boolean;

  @ApiProperty({ example: 3 })
  SupportType: number;

  @ApiProperty({ example: 0 })
  PickType: number;

  @ApiProperty({ example: 0 })
  DeliverType: number;

  @ApiProperty({ example: '' })
  ReasonCode: string;

  @ApiProperty({ example: '' })
  ReasonMessage: string;

  @ApiProperty({ required: false })
  OnDates: unknown;

  @ApiProperty({
    example: { From: null, To: null, Return: null },
  })
  WhiteListClient: {
    From: unknown;
    To: unknown;
    Return: unknown;
  };

  @ApiProperty({
    example: { From: null, To: null },
  })
  WhiteListWard: {
    From: unknown;
    To: unknown;
  };

  @ApiProperty({ example: 1 })
  IsEnable: number;

  @ApiProperty({ example: 0 })
  UpdatedBy: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  CreatedAt: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  UpdatedAt: string;

  @ApiProperty({ example: 1, description: '1: Unlock, 2: Lock' })
  Status: number;

  @ApiProperty({ example: '192.168.1.1' })
  UpdatedIP: string;

  @ApiProperty({ example: 0 })
  UpdatedEmployee: number;

  @ApiProperty({ example: 'web' })
  UpdatedSource: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  UpdatedDate: string;
}

export class GHNShopOfficeAddressInGHNEntity {
  @ApiProperty({ type: GhnProvinceEntity })
  fromProvince: GhnProvinceEntity;

  @ApiProperty({ type: GhnDistrictEntity })
  fromDistrict: GhnDistrictEntity;

  @ApiProperty({ type: GhnWardEntity })
  fromWard: GhnWardEntity;
}

export class GHNShopOfficeAddressEntity {
  @ApiProperty({ type: AddressEntity })
  shopOfficeAddressInDb: AddressEntity;

  @ApiProperty({ type: GHNShopOfficeAddressInGHNEntity })
  shopOfficeAddressInGHN: GHNShopOfficeAddressInGHNEntity;
}
