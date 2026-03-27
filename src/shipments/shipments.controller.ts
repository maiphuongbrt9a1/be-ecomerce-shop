import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import {
  ShipmentEntity,
  EnrichedPackageDetailEntity,
} from './entities/shipment.entity';
import { ShipmentWithFullInformationEntity } from './entities/shipment-with-full-information.entity';
import {
  CalculateExpectedDeliveryTimeResponseDto,
  GetServiceResponseDto,
  GHNShopDetailDto,
  PackageDetailDto,
  PackageItemDetailDto,
  PackageItemDetailForGHNCreateNewOrderRequestDto,
} from '@/orders/dto/group-order-items-package-response.dto';
import {
  PreviewFeeAndDiscountAndPriceForOrderDto,
  PreviewPackageDetailWithChecksumDto,
} from './dto/preview-shipping-fee-for-order.dto';
import { SecondCreateOrderItemsDto } from '@/orders/dto/create-order.dto';
import { CreateAddressForOrderResponseDto } from '@/address/dto/create-address-for-order-response.dto';

@ApiExtraModels(EnrichedPackageDetailEntity)
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @ApiOperation({ summary: 'Create a new shipment' })
  @ApiBody({
    description:
      'Shipment creation data with order, staff assignment and delivery schedule',
    type: CreateShipmentDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Shipment created successfully with staff and order details',
    type: ShipmentWithFullInformationEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid shipment data',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Order or staff not found',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Post()
  async create(@Body() createShipmentDto: CreateShipmentDto) {
    return await this.shipmentsService.create(createShipmentDto);
  }

  @ApiExtraModels(
    PreviewFeeAndDiscountAndPriceForOrderDto,
    SecondCreateOrderItemsDto,
    CreateAddressForOrderResponseDto,
    PackageDetailDto,
    PackageItemDetailDto,
    PackageItemDetailForGHNCreateNewOrderRequestDto,
    GHNShopDetailDto,
    GetServiceResponseDto,
    CalculateExpectedDeliveryTimeResponseDto,
    PreviewPackageDetailWithChecksumDto,
  )
  @ApiOperation({
    summary:
      'Preview package pricing, voucher discounts, GHN shipping fee, and checksum before creating an order',
    description:
      'Builds package data from order items and validated address data, applies item-level vouchers (priority: variant > product > category), selects the best user voucher for package-level discount, calculates GHN shipping service/fee/ETA, and returns a package payload plus checksum information for later order creation validation.',
  })
  @ApiBody({
    description:
      'Input for checkout preview. orderItems contains productVariantId and quantity per item. createNewAddressForOrderResponseDto must be the validated response from createNewAddressForOrder and is used to determine destination district/ward for GHN fee and ETA calculation.',
    type: PreviewFeeAndDiscountAndPriceForOrderDto,
  })
  @ApiResponse({
    status: 200,
    description:
      'Preview calculated successfully. Returns a map keyed by ghnShopId. Each value contains checksumInformation (checksumIdInDB, checksumData) and PackageDetail (items, applied vouchers, subtotal, package-level discount, total price, GHN service, shipping fee, origin/destination codes, and expected delivery time).',
    schema: {
      type: 'object',
      additionalProperties: {
        $ref: getSchemaPath(PreviewPackageDetailWithChecksumDto),
      },
      description:
        'Map keyed by GHN shop ID for checkout preview package payload used by create-order',
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid preview input or business validation failed, such as empty order items, invalid address payload, missing userId in address payload, out-of-stock variant, or GHN fee/ETA calculation failure.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found - User not found, product variant not found, shop origin location cannot be resolved in GHN, or no GHN shipping service is available for the selected origin/destination route.',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR', 'USER')
  @HttpCode(200)
  @Post(
    '/preview-shipping-fee-detail-and-discount-detail-and-price-detail-for-order',
  )
  async previewFeeAndDiscountAndPriceForOrder(
    @Body()
    previewFeeAndDiscountAndPriceForOrderDto: PreviewFeeAndDiscountAndPriceForOrderDto,
  ) {
    return await this.shipmentsService.previewFeeAndDiscountAndPriceForOrder(
      previewFeeAndDiscountAndPriceForOrderDto.orderItems,
      previewFeeAndDiscountAndPriceForOrderDto.createNewAddressForOrderResponseDto,
    );
  }

  @ApiOperation({ summary: 'Get all shipments' })
  @ApiResponse({
    status: 200,
    description:
      'Retrieved all shipments with staff and order information successfully',
    type: [ShipmentWithFullInformationEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({ status: 404, description: 'Not Found - No shipments found' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of items per page',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.shipmentsService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get one shipment' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved shipment with staff and order details successfully',
    type: ShipmentWithFullInformationEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid shipment ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Shipment does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR', 'USER')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.shipmentsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one shipment' })
  @ApiBody({
    description:
      'Shipment update data with optional tracking, status and delivery timestamps',
    type: UpdateShipmentDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Shipment updated successfully with staff and order details',
    type: ShipmentWithFullInformationEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid update data',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Shipment does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
  ) {
    return await this.shipmentsService.update(+id, updateShipmentDto);
  }

  @ApiOperation({ summary: 'Delete one shipment' })
  @ApiResponse({
    status: 200,
    description: 'Shipment deleted successfully',
    type: ShipmentEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid shipment ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Shipment does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.shipmentsService.remove(+id);
  }
}
