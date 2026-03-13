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
import { PreviewShippingFeeForPackagesDto } from './dto/preview-shipping-fee-for-order.dto';
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
    PreviewShippingFeeForPackagesDto,
    SecondCreateOrderItemsDto,
    CreateAddressForOrderResponseDto,
    PackageDetailDto,
    PackageItemDetailDto,
    PackageItemDetailForGHNCreateNewOrderRequestDto,
    GHNShopDetailDto,
    GetServiceResponseDto,
    CalculateExpectedDeliveryTimeResponseDto,
  )
  @ApiOperation({
    summary: 'Preview shipping fees for packages before creating shipments',
    description:
      'Calculates shipping fees and expected delivery time from GHN for order items before order confirmation. Input must include orderItems and createNewAddressForOrderResponseDto. Returns a record keyed by GHN shop ID, where each value is the computed package detail with GHN service, fee, pickup info, destination info, and ETA.',
  })
  @ApiBody({
    description:
      'Input payload for previewShippingFeeForOrder(orderItems, createNewAddressForOrderResponseDto).',
    type: PreviewShippingFeeForPackagesDto,
  })
  @ApiResponse({
    status: 200,
    description:
      'Shipping preview calculated successfully. Response is Record<string, PackageDetailDto>, where key = ghnShopId and value = package detail enriched by GHN data (shippingService, shippingFee, expectedDeliveryTime, ghnShopDetail, from/to district & ward codes).',
    schema: {
      type: 'object',
      additionalProperties: {
        $ref: getSchemaPath(PackageDetailDto),
      },
      description:
        'Map with GHN shop ID as object key and PackageDetailDto as value',
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Failed to calculate shipping fees. This may occur if GHN API communication fails, invalid package dimensions provided, or shipping service unavailable for the route.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found - Shop office not found for GHN shop ID, shop office has incomplete GHN address information (missing province/district/ward IDs), GHN province/district/ward not found in GHN system, or shipping service not available for the specified route.',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR', 'USER')
  @HttpCode(200)
  @Post('/preview-shipping-fee')
  async previewShippingFeeForEachPackageForOrder(
    @Body() previewShippingFeeDto: PreviewShippingFeeForPackagesDto,
  ) {
    return await this.shipmentsService.previewShippingFeeAndDiscountForEachOrderItemInOrder(
      previewShippingFeeDto.orderItems,
      previewShippingFeeDto.createNewAddressForOrderResponseDto,
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
