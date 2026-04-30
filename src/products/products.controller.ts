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
  UseInterceptors,
  UploadedFiles,
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
import { CreateFilterQueryDto } from './dto/filter-query.dto';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Public, Roles } from '@/decorator/customize';
import { ProductEntity } from './entities/product.entity';
import { ProductWithVariantsAndMediaEntity } from './entities/product-with-variants-and-media.entity';
import { ProductVariantWithMediaEntity } from '@/product-variants/entities/product-variant-with-media.entity';
import { ReviewWithMediaEntity } from '@/reviews/entities/review-with-media.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { RequestWithUserInJWTStrategy } from '@/helpers/auth/interfaces/RequestWithUser.interface';

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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product creation data with image files',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Product image files',
        },
        name: { type: 'string', example: 'Sample product name' },
        description: {
          type: 'string',
          example: 'Sample product description',
        },
        price: { type: 'number', example: 12 },
        currencyUnit: { type: 'string', example: 'VND' },
        stockKeepingUnit: { type: 'string', example: 'ADSFDSAF1463218FA' },
        stock: { type: 'number', example: 25 },
        createByUserId: { type: 'number', example: 1231 },
        categoryId: { type: 'number', example: 1325 },
        voucherId: { type: 'number', example: 1325 },
      },
      required: [
        'files',
        'name',
        'price',
        'currencyUnit',
        'stockKeepingUnit',
        'stock',
        'createByUserId',
      ],
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  @Post()
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
    @Request() req: RequestWithUserInJWTStrategy,
  ) {
    return await this.productsService.create(
      files,
      createProductDto,
      req.user.userId.toString(),
    );
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

  @ApiOperation({ summary: 'Generate a unique 4-digit SKU code for a new product' })
  @ApiResponse({
    status: 200,
    description: 'Unique SKU generated successfully',
    schema: { type: 'object', properties: { sku: { type: 'string', example: 'SKU-4521' } } },
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('generate-sku')
  async generateSku(): Promise<{ sku: string }> {
    return this.productsService.generateUniqueSku();
  }

  @ApiOperation({ summary: 'Filter product variants' })
  @ApiResponse({
    status: 200,
    description: 'Product variants filtered successfully',
    type: [ProductVariantWithMediaEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid filter query parameters',
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
  @ApiQuery({
    name: 'searchText',
    required: false,
    type: String,
    example: 'iPhone',
    description: 'Search product variant name by text',
  })
  @ApiQuery({
    name: 'categories',
    required: false,
    type: String,
    isArray: true,
    example: ['electronics', 'clothing'],
    description: 'Category name keywords to match with contains logic',
  })
  @ApiQuery({
    name: 'priceRange',
    required: false,
    type: Number,
    isArray: true,
    example: [10, 100],
    description: 'Minimum and maximum price range',
  })
  @ApiQuery({
    name: 'colors',
    required: false,
    type: String,
    isArray: true,
    example: ['red', 'blue'],
    description: 'Color names to match with contains logic',
  })
  @ApiQuery({
    name: 'sizes',
    required: false,
    type: String,
    isArray: true,
    example: ['S', 'M', 'L'],
    description: 'Variant sizes to filter by',
  })
  @ApiQuery({
    name: 'conditions',
    required: false,
    type: String,
    isArray: true,
    example: ['new', 'used', 'best_selling'],
    description: 'Variant conditions to filter by',
  })
  @ApiQuery({
    name: 'features',
    required: false,
    type: String,
    isArray: true,
    example: ['free_shipping', 'on_sale'],
    description: 'Product features to filter by',
  })
  @Public()
  @Get('/filter')
  async filterProducts(
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
    @Query() createFilterQueryDto: CreateFilterQueryDto,
  ) {
    return await this.productsService.filterProducts(
      Number(page),
      Number(perPage),
      createFilterQueryDto,
    );
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Product update data with optional image files and media IDs to delete',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Product image files to upload',
        },
        name: { type: 'string', example: 'Updated product name' },
        description: {
          type: 'string',
          example: 'Updated product description',
        },
        price: { type: 'number', example: 12 },
        currencyUnit: { type: 'string', example: 'VND' },
        stockKeepingUnit: { type: 'string', example: 'ADSFDSAF1463218FA' },
        stock: { type: 'number', example: 25 },
        createByUserId: { type: 'number', example: 1231 },
        categoryId: { type: 'number', example: 1325 },
        voucherId: { type: 'number', example: 1325 },
        mediaIdsToDelete: {
          type: 'array',
          items: {
            type: 'string',
            format: 'int64',
            example: '9007199254740993',
          },
          description:
            'Array of media IDs to delete. Big integers should be sent as strings.',
        },
      },
      required: [],
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  @Patch('/:id')
  async update(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: RequestWithUserInJWTStrategy,
  ) {
    return await this.productsService.update(
      files,
      +id,
      updateProductDto,
      req.user.userId.toString(),
    );
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
