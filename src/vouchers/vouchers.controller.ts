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
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles, Public } from '@/decorator/customize';
import { VoucherEntity } from './entities/voucher.entity';
import { VoucherWithCategoriesEntity } from './entities/voucher-with-categories.entity';
import { VoucherWithProductsEntity } from './entities/voucher-with-products.entity';
import { VoucherWithProductVariantsEntity } from './entities/voucher-with-product-variants.entity';
import { SearchVoucherDto } from './dto/search-voucher.dto';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @ApiOperation({ summary: 'Create a new voucher' })
  @ApiBody({
    description:
      'Voucher data with code, discount type, value and validity period',
    type: CreateVoucherDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Voucher created successfully',
    type: VoucherEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() createVoucherDto: CreateVoucherDto) {
    return await this.vouchersService.create(createVoucherDto);
  }

  @ApiOperation({ summary: 'Get all vouchers' })
  @ApiResponse({
    status: 200,
    description: 'List of all vouchers',
    type: [VoucherEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  @Public()
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.vouchersService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Search and filter vouchers' })
  @ApiResponse({
    status: 200,
    description: 'Filtered list of vouchers',
    type: [VoucherEntity],
  })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({
    name: 'discountType',
    required: false,
    enum: ['PERCENTAGE', 'FIXED_AMOUNT'],
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 50 })
  @Public()
  @Get('/search')
  async search(
    @Query('code') code?: string,
    @Query('discountType') discountType?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 50,
  ) {
    const dto: SearchVoucherDto = {
      code: code || undefined,
      discountType:
        discountType === 'PERCENTAGE' || discountType === 'FIXED_AMOUNT'
          ? (discountType as SearchVoucherDto['discountType'])
          : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    };
    return await this.vouchersService.search(
      dto,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get a voucher' })
  @ApiResponse({
    status: 200,
    description: 'Voucher details',
    type: VoucherEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @Public()
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.vouchersService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a voucher' })
  @ApiBody({
    description:
      'Voucher update data with optional fields for discount, validity and status',
    type: UpdateVoucherDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Voucher updated successfully',
    type: VoucherEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ) {
    return await this.vouchersService.update(+id, updateVoucherDto);
  }

  @ApiOperation({ summary: 'Delete a voucher' })
  @ApiResponse({
    status: 200,
    description: 'Voucher deleted successfully',
    type: VoucherEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
    description: 'List of vouchers with applied categories',
    type: [VoucherWithCategoriesEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  @Public()
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
    description: 'List of vouchers with applied products',
    type: [VoucherWithProductsEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  @Public()
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
    description: 'List of vouchers with applied product variants',
    type: [VoucherWithProductVariantsEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  @Public()
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
