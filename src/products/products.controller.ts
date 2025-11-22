import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Create a new product' })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({ type: CreateProductDto })
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Get all products' })
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.productsService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get one product' })
  @ApiResponse({ status: 200, description: 'Get one product' })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one product' })
  @ApiResponse({ status: 200, description: 'Update one product' })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({ type: UpdateProductDto })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(+id, updateProductDto);
  }

  @ApiOperation({ summary: 'Delete one product' })
  @ApiResponse({ status: 200, description: 'Delete one product' })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(+id);
  }
}
