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
  Request,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Public, Roles } from '@/decorator/customize';
import { ProductEntity } from './entities/product.entity';
import { ProductWithVariantsAndMediaEntity } from './entities/product-with-variants-and-media.entity';
import { ProductVariantWithMediaEntity } from '@/product-variants/entities/product-variant-with-media.entity';
import { ReviewWithMediaEntity } from '@/reviews/entities/review-with-media.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductWithVariantsAndMediaEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Failed to create product or upload files',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have ADMIN role',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiConsumes('application/json')
  @ApiBody({
    description:
      'Product creation data with name, description, and category information',
    type: CreateProductDto,
  })
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully with pagination',
    type: [ProductWithVariantsAndMediaEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
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
    return await this.productsService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get one product' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductWithVariantsAndMediaEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid product ID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Product with the specified ID does not exist',
  })
  @Public()
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductWithVariantsAndMediaEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({
    description:
      'Product update data with optional name, description, and category information',
    type: UpdateProductDto,
  })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(+id, updateProductDto);
  }

  @ApiOperation({ summary: 'Delete one product' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    type: ProductEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(+id);
  }

  @ApiOperation({ summary: 'Get all product-variants of this product' })
  @ApiResponse({
    status: 200,
    description: 'Product variants retrieved successfully',
    type: [ProductVariantWithMediaEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid product ID format',
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found - Product variants not found for the specified product ID',
  })
  @Public()
  @Get('/:id/product-variants')
  async getAllProductVariantsOfProduct(@Param('id') id: string) {
    return await this.productsService.getAllProductVariantsOfProduct(+id);
  }

  @ApiOperation({ summary: 'Get all reviews of this product' })
  @ApiResponse({
    status: 200,
    description: 'Product reviews retrieved successfully',
    type: [ReviewWithMediaEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
  })
  @Public()
  @Get('/:id/reviews')
  async getAllReviewsOfProduct(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.productsService.getAllReviewsOfProduct(
      +id,
      Number(page),
      Number(perPage),
    );
  }
}
