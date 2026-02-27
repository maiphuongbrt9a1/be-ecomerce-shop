import { ApiProperty } from '@nestjs/swagger';

/**
 * Address Base Information - Common fields for all GHN address types
 */
class GhnAddressBase {
  @ApiProperty({ example: 1, description: 'Enable status' })
  IsEnable: number;

  @ApiProperty({ example: 1, description: 'Status code (1: Unlock, 2: Lock)' })
  Status: number;

  @ApiProperty({
    example: '2024-01-15T10:30:00',
    description: 'Creation timestamp',
  })
  CreatedAt: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00',
    description: 'Last update timestamp',
  })
  UpdatedAt: string;

  @ApiProperty({ example: 1, description: 'Updated by user ID' })
  UpdatedBy: number;

  @ApiProperty({
    example: '192.168.1.1',
    description: 'IP address that last updated',
  })
  UpdatedIP: string;

  @ApiProperty({ example: 1, description: 'Employee ID that last updated' })
  UpdatedEmployee: number;

  @ApiProperty({ example: 'API', description: 'Source of last update' })
  UpdatedSource: string;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Date of last update',
  })
  UpdatedDate: string;
}

/**
 * GHN Province Information
 */
export class GhnProvinceDto extends GhnAddressBase {
  @ApiProperty({ example: 1, description: 'Unique province identifier in GHN' })
  ProvinceID: number;

  @ApiProperty({ example: 'Hồ Chí Minh', description: 'Name of the province' })
  ProvinceName: string;

  @ApiProperty({ example: 1, description: 'Country ID' })
  CountryID: number;

  @ApiProperty({ example: 'HCM', description: 'Province code' })
  Code: string;

  @ApiProperty({
    example: ['Ho Chi Minh', 'TP. Hồ Chí Minh'],
    type: [String],
    description: 'Alternative names for the province',
  })
  NameExtension: string[];

  @ApiProperty({ example: 1, description: 'Regional grouping ID' })
  RegionID: number;

  @ApiProperty({ example: 1, description: 'Regional CPN code' })
  RegionCPN: number;
}

/**
 * GHN District Information
 */
export class GhnDistrictDto extends GhnAddressBase {
  @ApiProperty({ example: 1, description: 'Unique district identifier in GHN' })
  DistrictID: number;

  @ApiProperty({ example: 1, description: 'Parent province ID' })
  ProvinceID: number;

  @ApiProperty({ example: 'Quận 1', description: 'Name of the district' })
  DistrictName: string;

  @ApiProperty({ example: 'Q1', description: 'District code' })
  Code: string;

  @ApiProperty({ example: 1, description: 'District type code' })
  Type: number;

  @ApiProperty({ example: 1, description: 'Support type code' })
  SupportType: number;

  @ApiProperty({
    example: ['District 1', 'Quận 1'],
    type: [String],
    description: 'Alternative names for the district',
  })
  NameExtension: string[];

  @ApiProperty({
    example: true,
    description: 'Whether COD can be updated for this district',
  })
  CanUpdateCOD: boolean;

  @ApiProperty({ example: 1, description: 'Pick-up type' })
  PickType: number;

  @ApiProperty({ example: 1, description: 'Delivery type' })
  DeliverType: number;

  @ApiProperty({ example: '', description: 'Reason code if any restrictions' })
  ReasonCode: string;

  @ApiProperty({
    example: '',
    description: 'Reason message if any restrictions',
  })
  ReasonMessage: string;

  @ApiProperty({ example: null, description: 'On-dates information' })
  OnDates: unknown;

  @ApiProperty({
    example: { From: null, To: null, Return: null },
    description: 'White list client configuration',
  })
  WhiteListClient: {
    From: unknown;
    To: unknown;
    Return: unknown;
  };

  @ApiProperty({
    example: { From: null, To: null },
    description: 'White list ward configuration',
  })
  WhiteListWard: {
    From: unknown;
    To: unknown;
  };
}

/**
 * GHN Ward Information
 */
export class GhnWardDto extends GhnAddressBase {
  @ApiProperty({ example: '00123', description: 'Unique ward code in GHN' })
  WardCode: string;

  @ApiProperty({ example: 1, description: 'Parent district ID' })
  DistrictID: number;

  @ApiProperty({ example: 'Phường 1', description: 'Name of the ward' })
  WardName: string;

  @ApiProperty({
    example: ['Ward 1', 'Phường 1'],
    type: [String],
    description: 'Alternative names for the ward',
  })
  NameExtension: string[];

  @ApiProperty({
    example: true,
    description: 'Whether COD can be updated for this ward',
  })
  CanUpdateCOD: boolean;

  @ApiProperty({ example: 1, description: 'Support type' })
  SupportType: number;

  @ApiProperty({ example: 1, description: 'Pick-up type' })
  PickType: number;

  @ApiProperty({ example: 1, description: 'Delivery type' })
  DeliverType: number;

  @ApiProperty({ example: '', description: 'Reason code if any restrictions' })
  ReasonCode: string;

  @ApiProperty({
    example: '',
    description: 'Reason message if any restrictions',
  })
  ReasonMessage: string;

  @ApiProperty({ example: null, description: 'On-dates information' })
  OnDates: unknown;

  @ApiProperty({
    example: { From: null, To: null, Return: null },
    description: 'White list client configuration',
  })
  WhiteListClient: {
    From: unknown;
    To: unknown;
    Return: unknown;
  };

  @ApiProperty({
    example: { From: null, To: null },
    description: 'White list ward configuration',
  })
  WhiteListWard: {
    From: unknown;
    To: unknown;
  };
}

/**
 * Database Address Information
 */
export class DatabaseAddressDto {
  @ApiProperty({
    example: 1,
    description: 'Unique address identifier in database',
  })
  id: bigint;

  @ApiProperty({
    example: 1,
    nullable: true,
    description: 'User ID if address belongs to a user',
  })
  userId: bigint | null;

  @ApiProperty({
    example: '123 Hồ Xuân Hương Street',
    description: 'Street address',
  })
  street: string;

  @ApiProperty({ example: 'Đông Hòa', description: 'Ward name' })
  ward: string;

  @ApiProperty({ example: 'Dĩ An', description: 'District name' })
  district: string;

  @ApiProperty({ example: 'Bình Dương', description: 'Province name' })
  province: string;

  @ApiProperty({ example: '75000', description: 'Postal/Zip code' })
  zipCode: string;

  @ApiProperty({ example: 'Vietnam', description: 'Country name' })
  country: string;

  @ApiProperty({
    example: 1,
    nullable: true,
    description: 'Shop office ID if address belongs to a shop',
  })
  shopOfficeId: bigint | null;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Address creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Address last update timestamp',
  })
  updatedAt: Date;
}

/**
 * Create Address For Order Response DTO
 *
 * Response from the create address for order endpoint.
 * Contains the newly created address from database and validated GHN shipping information.
 *
 * @remarks
 * - databaseAddress: The address record created in the database
 * - toProvince: GHN system's validated province information
 * - toDistrict: GHN system's validated district information
 * - toWard: GHN system's validated ward information
 *
 * This response is useful for:
 * - Confirming that the address was created successfully
 * - Getting the new address ID for future reference
 * - Validating that the address is deliverable via GHN
 * - Obtaining GHN's internal IDs for shipping calculations
 */
export class CreateAddressForOrderResponseDto {
  @ApiProperty({
    type: DatabaseAddressDto,
    description:
      'The newly created address record from the database with all stored information',
  })
  databaseAddress: DatabaseAddressDto;

  @ApiProperty({
    type: GhnProvinceDto,
    description:
      'Validated province information from GHN shipping system. Contains GHN IDs and metadata needed for shipping calculations',
  })
  toProvince: GhnProvinceDto;

  @ApiProperty({
    type: GhnDistrictDto,
    description:
      'Validated district information from GHN shipping system. Contains pickup/delivery types and other shipping-related metadata',
  })
  toDistrict: GhnDistrictDto;

  @ApiProperty({
    type: GhnWardDto,
    description:
      'Validated ward information from GHN shipping system. Contains final delivery location details',
  })
  toWard: GhnWardDto;
}
