import { CreateAddressForOrderResponseDto } from '@/address/dto/create-address-for-order-response.dto';
import { SecondCreateOrderItemsDto } from '@/orders/dto/create-order.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { PackageDetailDto } from '@/orders/dto/group-order-items-package-response.dto';

export class ChecksumInformationForOrderPreviewDto {
  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'number' }],
    example: '1234567890123456789',
    description:
      'Checksum record ID stored in database. Runtime type is bigint and may be serialized as string in JSON.',
  })
  checksumIdInDB: string | number;

  @ApiProperty({
    example: 'e9f4d4b2fba1a5f5585bbf9ef4d84e5f4f8f6cbe9d8e6d5f4c3b2a1908171615',
    description:
      'Checksum data used to validate package integrity before create-order.',
  })
  checksumData: string;
}

export class PreviewPackageDetailWithChecksumDto {
  @ApiProperty({ type: PackageDetailDto })
  PackageDetail: PackageDetailDto;

  @ApiProperty({ type: ChecksumInformationForOrderPreviewDto })
  checksumInformation: ChecksumInformationForOrderPreviewDto;
}

export class PreviewFeeAndDiscountAndPriceForOrderDto {
  @ApiProperty({
    type: [SecondCreateOrderItemsDto],
    description:
      'Order items for checkout preview. Each item requires productVariantId and quantity.',
    example: [{ productVariantId: 851, quantity: 8 }],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SecondCreateOrderItemsDto)
  orderItems: SecondCreateOrderItemsDto[];

  @ApiProperty({
    type: CreateAddressForOrderResponseDto,
    description:
      'Validated address payload returned by create-address-for-order endpoint. orderAddressInGHN and orderAddressInDb are required and are used to compute GHN service, shipping fee, and expected delivery time.',
  })
  @ValidateNested()
  @Type(() => CreateAddressForOrderResponseDto)
  createNewAddressForOrderResponseDto: CreateAddressForOrderResponseDto;
}
