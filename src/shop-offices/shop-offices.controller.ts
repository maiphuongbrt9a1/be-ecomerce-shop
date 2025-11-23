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
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';

@Controller('shop-offices')
export class ShopOfficesController {
  constructor(private readonly shopOfficesService: ShopOfficesService) {}

  @ApiOperation({ summary: 'Add new a shop office' })
  @ApiResponse({ status: 200, description: 'Add new a shop office' })
  @ApiBody({ type: CreateShopOfficeDto })
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN') // please check role is in Role enum of prisma schema
  @Post()
  async create(@Body() createShopOfficeDto: CreateShopOfficeDto) {
    return await this.shopOfficesService.create(createShopOfficeDto);
  }

  @ApiOperation({ summary: 'Get shop office list' })
  @ApiResponse({ status: 200, description: ' shop office list found!' })
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.shopOfficesService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get shop office detail by ID' })
  @ApiResponse({ status: 200, description: 'shop office found!' })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.shopOfficesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a shop office' })
  @ApiBody({ type: UpdateShopOfficeDto })
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
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN') // please check role is in Role enum of prisma schema
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.shopOfficesService.remove(+id);
  }
}
