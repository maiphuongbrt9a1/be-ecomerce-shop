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
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CreateAddressForOrderResponseDto } from './dto/create-address-for-order-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { AddressEntity } from './entities/address.entity';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({
    status: 201,
    description: 'Create a new address',
    type: AddressEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    description: 'Address creation data',
    type: CreateAddressDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Post()
  async create(@Body() createAddressDto: CreateAddressDto) {
    return await this.addressService.create(createAddressDto);
  }

  @ApiOperation({ summary: 'Get all addresses' })
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
  @ApiResponse({
    status: 200,
    description: 'Get all addresses',
    type: [AddressEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.addressService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get an address' })
  @ApiResponse({
    status: 200,
    description: 'Get an address',
    type: AddressEntity,
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.addressService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({
    status: 200,
    description: 'Update an address',
    type: AddressEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @ApiBody({
    description: 'Address update data',
    type: UpdateAddressDto,
  })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return await this.addressService.update(+id, updateAddressDto);
  }

  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({
    status: 200,
    description: 'Delete an address',
    type: AddressEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.addressService.remove(+id);
  }

  @ApiOperation({
    summary: 'Create a new address for order',
    description:
      'Creates a new shipping address that will be used for order fulfillment. This endpoint validates the address with GHN (Giao Hàng Nhanh) shipping service to ensure deliverability. The address is saved to the database and cross-validated against the GHN shipping system to ensure it can be delivered.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Address created successfully and validated with shipping provider. Returns both the database address record and the validated GHN province, district, and ward information with their IDs.',
    type: CreateAddressForOrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid request body, missing required fields, or the address could not be validated in the GHN system. Check that all required fields (street, ward, district, province, zipCode, country) are provided and valid.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found - The provided province, district, or ward was not found in the GHN shipping system database. Verify that spelling matches Vietnamese location names in the GHN system.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Internal Server Error - Failed to create address in database or communicate with GHN service',
  })
  @ApiBody({
    description:
      'Address creation data with location details (street, ward, district, province) and optional user association',
    type: CreateAddressDto,
    examples: {
      example1: {
        summary: 'User address creation',
        value: {
          userId: 1,
          street: '123 Hồ Xuân Hương Street',
          ward: 'Đông Hòa',
          district: 'Dĩ An',
          province: 'Bình Dương',
          zipCode: '75000',
          country: 'Vietnam',
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Post('/order-address')
  async createNewAddressForOrder(@Body() createAddressDto: CreateAddressDto) {
    return await this.addressService.createNewAddressForOrder(createAddressDto);
  }
}
