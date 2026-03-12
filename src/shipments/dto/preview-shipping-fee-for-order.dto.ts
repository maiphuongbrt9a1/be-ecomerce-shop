import { CreateAddressForOrderResponseDto } from '@/address/dto/create-address-for-order-response.dto';
import { SecondCreateOrderItemsDto } from '@/orders/dto/create-order.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

export class PreviewShippingFeeForPackagesDto {
  @ApiProperty({
    type: [SecondCreateOrderItemsDto],
    description:
      'Order items used to build shipping package(s). Each item must include productVariantId, quantity, unitPrice, discount fields, totalPrice, and currencyUnit.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SecondCreateOrderItemsDto)
  orderItems: SecondCreateOrderItemsDto[];

  @ApiProperty({
    type: CreateAddressForOrderResponseDto,
    description:
      'Validated delivery address payload returned from create-address-for-order endpoint. GHN destination district/ward in orderAddressInGHN are used to calculate service, fee, and expected delivery time.',
  })
  @ValidateNested()
  @Type(() => CreateAddressForOrderResponseDto)
  createNewAddressForOrderResponseDto: CreateAddressForOrderResponseDto;
}
