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
import {
  CreateShipmentDto,
  createNewShipmentForOrderAndAutoCreateGHNShipmentDto,
  PreviewShippingFeeForPackagesDto,
} from './dto/create-shipment.dto';
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

  @ApiOperation({
    summary:
      'Create shipments for order and automatically register with GHN shipping service',
    description:
      'Creates multiple shipment records for an order with automatic GHN API integration. Handles multi-warehouse fulfillment by creating separate GHN shipping orders for each warehouse. Validates payment status (COD or PAID) before creating shipments. Used in order fulfillment workflow after order confirmation.',
  })
  @ApiBody({
    description:
      'Shipment creation data with packages grouped by warehouse, validated delivery address, and GHN shipping configuration',
    type: createNewShipmentForOrderAndAutoCreateGHNShipmentDto,
  })
  @ApiResponse({
    status: 201,
    description:
      'Shipments created successfully and registered with GHN. Returns array of created shipment records (one per warehouse/package). Each shipment includes GHN order code, tracking number, and estimated delivery date.',
    type: [ShipmentEntity],
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid shipment data, GHN order creation failed, or database transaction failed. Check that packages contain valid product variants, GHN service configuration is correct, and shop offices are properly registered with GHN.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found - Order not found, shop office not found for GHN shop ID, or order item not found for product variant. Verify that orderId exists, all GHN shop IDs in packages correspond to registered shop offices, and all product variants exist in order items.',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Post('/create-with-ghn')
  async createNewShipmentForOrderAndAutoCreateGHNShipment(
    @Body()
    createNewShipmentForOrderAndAutoCreateGHNShipmentDto: createNewShipmentForOrderAndAutoCreateGHNShipmentDto,
  ) {
    return await this.shipmentsService.createNewShipmentForOrderAndAutoCreateGHNShipment(
      createNewShipmentForOrderAndAutoCreateGHNShipmentDto,
    );
  }

  @ApiExtraModels(
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
      'Calculates shipping fees and delivery estimates for each package from different warehouses using GHN API. Enriches package data with shipping costs, delivery times, and pickup/delivery location details. Used in checkout flow to display shipping costs to customers before order confirmation. Does not create actual shipments.',
  })
  @ApiBody({
    description:
      'Package data grouped by GHN shop ID (warehouse) and validated delivery address with GHN location IDs',
    type: PreviewShippingFeeForPackagesDto,
  })
  @ApiResponse({
    status: 200,
    description:
      'Shipping fees calculated successfully. Returns the input packages enriched with: shipping fee amount, shipping service details (Express/Standard/Saving), expected delivery time, pickup location details (shop name/address/phone), and GHN district/ward codes for both pickup and delivery locations. Total shipping fee = sum of all package fees.',
    schema: {
      type: 'object',
      additionalProperties: {
        $ref: getSchemaPath(PackageDetailDto),
      },
      description:
        'Object with ghnShopId as keys and enriched PackageDetail as values',
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
    return await this.shipmentsService.previewShippingFeeForEachPackageForOrder(
      previewShippingFeeDto.packages,
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
