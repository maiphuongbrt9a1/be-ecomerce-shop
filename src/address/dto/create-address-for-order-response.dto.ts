import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class WhiteListClientDto {
  @ApiProperty({
    required: true,
    type: 'array',
    items: { type: 'string' },
    example: [],
  })
  @IsArray()
  From: unknown;

  @ApiProperty({
    required: true,
    type: 'array',
    items: { type: 'string' },
    example: [],
  })
  @IsArray()
  To: unknown;

  @ApiProperty({
    required: true,
    type: 'array',
    items: { type: 'string' },
    example: [],
  })
  @IsArray()
  Return: unknown;
}

class WhiteListWardDto {
  @ApiProperty({
    required: true,
    oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'null' }],
    example: null,
  })
  @IsOptional()
  From: unknown;

  @ApiProperty({
    required: true,
    oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'null' }],
    example: null,
  })
  @IsOptional()
  To: unknown;
}

/**
 * Address Base Information - Common fields for all GHN address types
 */
class GhnAddressBase {
  @ApiProperty({ example: 1, description: 'Enable status' })
  @IsNumber()
  IsEnable: number;

  @ApiProperty({ example: 1, description: 'Status code (1: Unlock, 2: Lock)' })
  @IsNumber()
  Status: number;

  @ApiProperty({
    example: '2024-01-15T10:30:00',
    description: 'Creation timestamp',
  })
  @IsString()
  CreatedAt: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00',
    description: 'Last update timestamp',
  })
  @IsString()
  UpdatedAt: string;

  @ApiProperty({ example: 1, description: 'Updated by user ID' })
  @IsNumber()
  UpdatedBy: number;

  @ApiProperty({
    example: '192.168.1.1',
    description: 'IP address that last updated',
  })
  @IsString()
  UpdatedIP: string;

  @ApiProperty({ example: 1, description: 'Employee ID that last updated' })
  @IsNumber()
  UpdatedEmployee: number;

  @ApiProperty({ example: 'API', description: 'Source of last update' })
  @IsString()
  UpdatedSource: string;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Date of last update',
  })
  @IsString()
  UpdatedDate: string;
}

/**
 * GHN Province Information
 */
export class GhnProvinceDto extends GhnAddressBase {
  @ApiProperty({ example: 1, description: 'Unique province identifier in GHN' })
  @IsNumber()
  ProvinceID: number;

  @ApiProperty({ example: 'Hồ Chí Minh', description: 'Name of the province' })
  @IsString()
  ProvinceName: string;

  @ApiProperty({ example: 1, description: 'Country ID' })
  @IsNumber()
  CountryID: number;

  @ApiProperty({ example: 'HCM', description: 'Province code' })
  @IsString()
  Code: string;

  @ApiProperty({
    example: ['Ho Chi Minh', 'TP. Hồ Chí Minh'],
    type: [String],
    description: 'Alternative names for the province',
  })
  @IsString({ each: true })
  NameExtension: string[];

  @ApiProperty({ example: 1, description: 'Regional grouping ID' })
  @IsNumber()
  RegionID: number;

  @ApiProperty({ example: 1, description: 'Regional CPN code' })
  @IsNumber()
  RegionCPN: number;
}

/**
 * GHN District Information
 */
export class GhnDistrictDto extends GhnAddressBase {
  @ApiProperty({ example: 1, description: 'Unique district identifier in GHN' })
  @IsNumber()
  DistrictID: number;

  @ApiProperty({ example: 1, description: 'Parent province ID' })
  @IsNumber()
  ProvinceID: number;

  @ApiProperty({ example: 'Quận 1', description: 'Name of the district' })
  @IsString()
  DistrictName: string;

  @ApiProperty({ example: 'Q1', description: 'District code' })
  @IsString()
  Code: string;

  @ApiProperty({ example: 1, description: 'District type code' })
  @IsNumber()
  Type: number;

  @ApiProperty({ example: 1, description: 'Support type code' })
  @IsNumber()
  SupportType: number;

  @ApiProperty({
    example: ['District 1', 'Quận 1'],
    type: [String],
    description: 'Alternative names for the district',
  })
  @IsString({ each: true })
  NameExtension: string[];

  @ApiProperty({
    example: true,
    description: 'Whether COD can be updated for this district',
  })
  @IsBoolean()
  CanUpdateCOD: boolean;

  @ApiProperty({ example: 1, description: 'Pick-up type' })
  @IsNumber()
  PickType: number;

  @ApiProperty({ example: 1, description: 'Delivery type' })
  @IsNumber()
  DeliverType: number;

  @ApiProperty({ example: '', description: 'Reason code if any restrictions' })
  @IsString()
  ReasonCode: string;

  @ApiProperty({
    example: '',
    description: 'Reason message if any restrictions',
  })
  @IsString()
  ReasonMessage: string;

  @ApiProperty({
    required: true,
    nullable: true,
    oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'null' }],
    example: ['2023-01-25T17:00:00Z', '2024-02-13T17:00:00Z'],
    description: 'On-dates information',
  })
  @IsOptional()
  OnDates: unknown;

  @ApiProperty({
    required: true,
    type: WhiteListClientDto,
    example: { From: [], To: [], Return: [] },
    description: 'White list client configuration',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WhiteListClientDto)
  WhiteListClient: WhiteListClientDto;

  @ApiProperty({
    required: true,
    type: WhiteListWardDto,
    example: { From: null, To: null },
    description: 'White list ward configuration',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WhiteListWardDto)
  WhiteListWard: WhiteListWardDto;
}

/**
 * GHN Ward Information
 */
export class GhnWardDto extends GhnAddressBase {
  @ApiProperty({ example: '00123', description: 'Unique ward code in GHN' })
  @IsString()
  WardCode: string;

  @ApiProperty({ example: 1, description: 'Parent district ID' })
  @IsNumber()
  DistrictID: number;

  @ApiProperty({ example: 'Phường 1', description: 'Name of the ward' })
  @IsString()
  WardName: string;

  @ApiProperty({
    example: ['Ward 1', 'Phường 1'],
    type: [String],
    description: 'Alternative names for the ward',
  })
  @IsString({ each: true })
  NameExtension: string[];

  @ApiProperty({
    example: true,
    description: 'Whether COD can be updated for this ward',
  })
  @IsBoolean()
  CanUpdateCOD: boolean;

  @ApiProperty({ example: 1, description: 'Support type' })
  @IsNumber()
  SupportType: number;

  @ApiProperty({ example: 1, description: 'Pick-up type' })
  @IsNumber()
  PickType: number;

  @ApiProperty({ example: 1, description: 'Delivery type' })
  @IsNumber()
  DeliverType: number;

  @ApiProperty({ example: '', description: 'Reason code if any restrictions' })
  @IsString()
  ReasonCode: string;

  @ApiProperty({
    example: '',
    description: 'Reason message if any restrictions',
  })
  @IsString()
  ReasonMessage: string;

  @ApiProperty({
    required: true,
    nullable: true,
    oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'null' }],
    example: ['2023-01-25T17:00:00Z', '2024-02-13T17:00:00Z'],
    description: 'On-dates information',
  })
  @IsOptional()
  OnDates: unknown;

  @ApiProperty({
    required: true,
    type: WhiteListClientDto,
    example: { From: [], To: [], Return: [] },
    description: 'White list client configuration',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WhiteListClientDto)
  WhiteListClient: WhiteListClientDto;

  @ApiProperty({
    required: true,
    type: WhiteListWardDto,
    example: { From: null, To: null },
    description: 'White list ward configuration',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WhiteListWardDto)
  WhiteListWard: WhiteListWardDto;
}

/**
 * Database Address Information
 */
export class DatabaseAddressDto {
  @ApiProperty({
    example: 1,
    description: 'Unique address identifier in database',
  })
  @IsNumber()
  id: bigint;

  @ApiProperty({
    example: 1,
    nullable: true,
    description: 'User ID if address belongs to a user',
  })
  @IsOptional()
  @IsNumber()
  userId: bigint | null;

  @ApiProperty({
    example: '123 Hồ Xuân Hương Street',
    description: 'Street address',
  })
  @IsString()
  street: string;

  @ApiProperty({ example: 'Đông Hòa', description: 'Ward name' })
  @IsString()
  ward: string;

  @ApiProperty({ example: 'Dĩ An', description: 'District name' })
  @IsString()
  district: string;

  @ApiProperty({ example: 'Bình Dương', description: 'Province name' })
  @IsString()
  province: string;

  @ApiProperty({ example: '75000', description: 'Postal/Zip code' })
  @IsString()
  zipCode: string;

  @ApiProperty({ example: 'Vietnam', description: 'Country name' })
  @IsString()
  country: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Address creation timestamp',
  })
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Address last update timestamp',
  })
  @Type(() => Date)
  updatedAt: Date;
}

/**
 * GHN Address Components for Order Delivery
 *
 * Nested object containing validated address components from GHN shipping system.
 * Used within CreateAddressForOrderResponseDto to organize delivery location details.
 *
 * @remarks
 * - toProvince: GHN system's validated province information for delivery location
 * - toDistrict: GHN system's validated district information for delivery location
 * - toWard: GHN system's validated ward information for delivery location
 * All three components are required for shipping fee calculations and shipment creation
 */
export class OrderAddressInGHNDto {
  @ApiProperty({
    type: GhnProvinceDto,
    description:
      'Validated destination province information from GHN shipping system. Contains GHN province ID and metadata needed for GHN API calls',
  })
  @ValidateNested()
  @Type(() => GhnProvinceDto)
  toProvince: GhnProvinceDto;

  @ApiProperty({
    type: GhnDistrictDto,
    description:
      'Validated destination district information from GHN shipping system. Contains pickup/delivery types, COD support, and other shipping-related capabilities',
  })
  @ValidateNested()
  @Type(() => GhnDistrictDto)
  toDistrict: GhnDistrictDto;

  @ApiProperty({
    type: GhnWardDto,
    description:
      'Validated destination ward information from GHN shipping system. Contains support type for final delivery location and delivery constraints',
  })
  @ValidateNested()
  @Type(() => GhnWardDto)
  toWard: GhnWardDto;
}

/**
 * Create Address For Order Response DTO
 *
 * Response from the create address for order endpoint after successful validation with GHN.
 * Contains both the newly created address from database and validated GHN shipping information.
 *
 * @remarks
 * - orderAddressInDb: The address record created in the local database (contains ID for future reference)
 * - orderAddressInGHN: GHN system's validated address components for order delivery
 *   - toProvince: Destination province with GHN province ID
 *   - toDistrict: Destination district with GHN district ID and delivery capabilities
 *   - toWard: Destination ward with GHN ward code and support information
 *
 * This response is useful for:
 * - Confirming that the address was created successfully in database
 * - Getting the new address ID for future reference in orders
 * - Validating that the address is deliverable via GHN shipping service
 * - Obtaining GHN's internal location IDs (ProvinceID, DistrictID, WardCode) for shipping calculations and shipment creation
 *
 * Used in checkout flow to confirm delivery address and calculate shipping fees
 */
export class CreateAddressForOrderResponseDto {
  @ApiProperty({
    type: DatabaseAddressDto,
    description:
      'The newly created address record from the database with ID and all address components (street, ward, district, province, country, zipCode)',
  })
  @ValidateNested()
  @Type(() => DatabaseAddressDto)
  orderAddressInDb: DatabaseAddressDto;

  @ApiProperty({
    type: OrderAddressInGHNDto,
    description:
      'GHN (Giao Hàng Nhanh) validated address components for order delivery location. Contains province, district, and ward details with their GHN system IDs required for shipping fee calculation and shipment creation',
  })
  @ValidateNested()
  @Type(() => OrderAddressInGHNDto)
  orderAddressInGHN: OrderAddressInGHNDto;
}
