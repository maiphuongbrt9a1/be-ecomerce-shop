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
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles, Public } from '@/decorator/customize';
import { ShopOfficeEntity } from './entities/shop-office.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { AddressEntity } from '@/address/entities/address.entity';
import { ProductEntity } from '@/products/entities/product.entity';
import { CategoryEntity } from '@/category/entities/category.entity';

@Controller('shop-offices')
export class ShopOfficesController {
  constructor(private readonly shopOfficesService: ShopOfficesService) {}

  @ApiOperation({ summary: 'Add new a shop office' })
  @ApiResponse({ status: 201, description: 'Add new a shop office', type: ShopOfficeEntity })
  @ApiBody({ type: CreateShopOfficeDto })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN') // please check role is in Role enum of prisma schema
  @Post()
  async create(@Body() createShopOfficeDto: CreateShopOfficeDto) {
    return await this.shopOfficesService.create(createShopOfficeDto);
  }

  @ApiOperation({ summary: 'Get shop office list' })
  @ApiResponse({ status: 200, description: ' shop office list found!', type: [ShopOfficeEntity] })
  @Public()
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.shopOfficesService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get shop office detail by ID' })
  @ApiResponse({ status: 200, description: 'shop office found!', type: ShopOfficeEntity })
  @Public()
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.shopOfficesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a shop office' })
  @ApiResponse({ status: 200, description: 'Update a shop office', type: ShopOfficeEntity })
  @ApiBody({ type: UpdateShopOfficeDto })
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
  @ApiResponse({ status: 200, description: 'Delete a shop office', type: ShopOfficeEntity })
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
    description: 'shop office"s manager list found!',
    type: [UserEntity],
  })
  @Public()
  @Get('/:id/manager-list')
  async findAllManagersOfShopOffice(@Param('id') id: string) {
    return await this.shopOfficesService.findAllManagersOfShopOffice(+id);
  }

  @ApiOperation({ summary: 'Get shop office"s address by ID shop office' })
  @ApiResponse({
    status: 200,
    description: 'shop office"s address found!',
    type: AddressEntity,
  })
  @Public()
  @Get('/:id/address')
  async findAddressOfShopOffice(@Param('id') id: string) {
    return await this.shopOfficesService.findAddressOfShopOffice(+id);
  }

  @ApiOperation({ summary: 'Get shop office"s products by ID shop office' })
  @ApiResponse({
    status: 200,
    description: 'shop office"s products found!',
    type: [ProductEntity],
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
    description: 'shop office"s categories found!',
    type: [CategoryEntity],
  })
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
    description: 'shop office"s products of category found!',
    type: [ProductEntity],
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
}
