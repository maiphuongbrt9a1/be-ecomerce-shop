import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Create a new address' })
  @Post()
  async create(@Body() createAddressDto: CreateAddressDto) {
    return await this.addressService.create(createAddressDto);
  }

  @ApiOperation({ summary: 'Get all addresses' })
  @ApiResponse({ status: 200, description: 'Get all addresses' })
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.addressService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get an address' })
  @ApiResponse({ status: 200, description: 'Get an address' })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.addressService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({ status: 200, description: 'Update an address' })
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return await this.addressService.update(+id, updateAddressDto);
  }

  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({ status: 200, description: 'Delete an address' })
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.addressService.remove(+id);
  }
}
