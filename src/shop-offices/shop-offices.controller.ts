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
import { ShopOfficesService } from './shop-offices.service';
import { CreateShopOfficeDto } from './dto/create-shop-office.dto';
import { UpdateShopOfficeDto } from './dto/update-shop-office.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles, Public } from '@/decorator/customize';
import {
  ShopOfficeEntity,
  ShopOfficeWithProductsEntity,
  GHNShopDetailEntity,
} from './entities/shop-office.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { AddressEntity } from '@/address/entities/address.entity';
import { ProductEntity } from '@/products/entities/product.entity';
import { CategoryEntity } from '@/category/entities/category.entity';

@Controller('shop-offices')
export class ShopOfficesController {
  constructor(private readonly shopOfficesService: ShopOfficesService) {}

  @ApiOperation({ summary: 'Add new a shop office' })
  @ApiResponse({
    status: 201,
    description: 'Shop office created successfully and registered with GHN',
    type: ShopOfficeEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBody({
    description: 'Shop office creation data with address for GHN registration',
    type: CreateShopOfficeDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN') // please check role is in Role enum of prisma schema
  @Post()
  async create(@Body() createShopOfficeDto: CreateShopOfficeDto) {
    return await this.shopOfficesService.create(createShopOfficeDto);
  }

  @ApiOperation({ summary: 'Get shop office list' })
  @ApiResponse({
    status: 200,
    description: 'Shop office list retrieved successfully',
    type: [ShopOfficeEntity],
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
    return await this.shopOfficesService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get shop office detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'Shop office retrieved successfully',
    type: ShopOfficeEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @Public()
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.shopOfficesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a shop office' })
  @ApiResponse({
    status: 200,
    description: 'Shop office updated successfully',
    type: ShopOfficeEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBody({
    description: 'Shop office update data',
    type: UpdateShopOfficeDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN') // please check role is in Role enum of prisma schema
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateShopOfficeDto: UpdateShopOfficeDto,
  ) {
    return await this.shopOfficesService.update(+id, updateShopOfficeDto);
  }

  @ApiOperation({ summary: 'Delete a shop office' })
  @ApiResponse({
    status: 200,
    description: 'Shop office deleted successfully',
    type: ShopOfficeEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN') // please check role is in Role enum of prisma schema
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.shopOfficesService.remove(+id);
  }

  @ApiOperation({ summary: 'Get shop office"s manager list by ID shop office' })
  @ApiResponse({
    status: 200,
    description: 'Shop office manager list retrieved successfully',
    type: [UserEntity],
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
  @Get('/:id/manager-list')
  async findAllManagersOfShopOffice(@Param('id') id: string) {
    return await this.shopOfficesService.findAllManagersOfShopOffice(+id);
  }

  @ApiOperation({ summary: 'Get shop office"s address by ID shop office' })
  @ApiResponse({
    status: 200,
    description: 'Shop office address retrieved successfully',
    type: AddressEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @Public()
  @Get('/:id/address')
  async findAddressOfShopOffice(@Param('id') id: string) {
    return await this.shopOfficesService.findAddressOfShopOffice(+id);
  }

  @ApiOperation({ summary: 'Get shop office"s products by ID shop office' })
  @ApiResponse({
    status: 200,
    description: 'Shop office products retrieved successfully',
    type: [ProductEntity],
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
  @Get('/:id/product-list')
  async findAllProductsOfShopOffice(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.shopOfficesService.findAllProductsOfShopOffice(
      +id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get shop office"s categories by ID shop office' })
  @ApiResponse({
    status: 200,
    description: 'Shop office categories retrieved successfully',
    type: [CategoryEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @Public()
  @Get('/:id/category-list')
  async findAllCategoryOfShopOffice(@Param('id') id: string) {
    return await this.shopOfficesService.findAllCategoryOfShopOffice(+id);
  }

  @ApiOperation({
    summary:
      'Get shop office"s products of one category by ID shop office and ID category',
  })
  @ApiResponse({
    status: 200,
    description: 'Shop office products of category retrieved successfully',
    type: [ShopOfficeWithProductsEntity],
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
  @Get('/:shopId/category/:categoryId/product-list')
  async findAllProductsOfCategoryOfShopOffice(
    @Param('shopId') shopId: string,
    @Param('categoryId') categoryId: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.shopOfficesService.findAllProductsOfCategoryOfShopOffice(
      +shopId,
      +categoryId,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get GHN shop office details by shop office ID' })
  @ApiResponse({
    status: 200,
    description: 'GHN shop office details retrieved successfully',
    type: GHNShopDetailEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @Get('/:id/ghn-details')
  async getGHNShopOffice(@Param('id') id: string) {
    return await this.shopOfficesService.getGHNShopOffice(+id);
  }
}
