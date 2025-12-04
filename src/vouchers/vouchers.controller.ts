import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import { VoucherEntity } from './entities/voucher.entity';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @ApiOperation({ summary: 'Create a new voucher' })
  @ApiResponse({ status: 201, description: 'Create a new voucher', type: VoucherEntity })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({ type: CreateVoucherDto })
  @Post()
  async create(@Body() createVoucherDto: CreateVoucherDto) {
    return await this.vouchersService.create(createVoucherDto);
  }

  @ApiOperation({ summary: 'Get all vouchers' })
  @ApiResponse({ status: 200, description: 'Get all vouchers', type: [VoucherEntity] })
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.vouchersService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get a voucher' })
  @ApiResponse({ status: 200, description: 'Get a voucher', type: VoucherEntity })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.vouchersService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a voucher' })
  @ApiResponse({ status: 200, description: 'Update a voucher', type: VoucherEntity })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({ type: UpdateVoucherDto })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ) {
    return await this.vouchersService.update(+id, updateVoucherDto);
  }

  @ApiOperation({ summary: 'Delete a voucher' })
  @ApiResponse({ status: 200, description: 'Delete a voucher', type: VoucherEntity })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.vouchersService.remove(+id);
  }

  @ApiOperation({ summary: 'Get all categories are applied this voucher' })
  @ApiResponse({
    status: 200,
    description: 'Get all categories are applied this voucher',
  })
  @Get('/:id/all-categories-applied')
  async getAllCategoriesAreAppliedThisVoucher(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.vouchersService.getAllCategoriesAreAppliedThisVoucher(
      +id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get all products are applied this voucher' })
  @ApiResponse({
    status: 200,
    description: 'Get all products are applied this voucher',
  })
  @Get('/:id/all-products-applied')
  async getAllProductsAreAppliedThisVoucher(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.vouchersService.getAllProductsAreAppliedThisVoucher(
      +id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({
    summary: 'Get all product-variants are applied this voucher',
  })
  @ApiResponse({
    status: 200,
    description: 'Get all product-variants are applied this voucher',
  })
  @Get('/:id/all-product-variants-applied')
  async getAllProductVariantsAreAppliedThisVoucher(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.vouchersService.getAllProductVariantsAreAppliedThisVoucher(
      +id,
      Number(page),
      Number(perPage),
    );
  }
}
