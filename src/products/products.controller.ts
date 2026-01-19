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
  UseInterceptors,
  Request,
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
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Public, Roles } from '@/decorator/customize';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { RequestWithUserInJWTStrategy } from '@/helpers/auth/interfaces/RequestWithUser.interface';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    schema: {
      example: {
        id: 1,
        name: 'Sample product name',
        description: 'Sample product description',
        price: 12,
        stockKeepingUnit: 'ADSFDSAF1463218FA',
        stock: 25,
        createByUserId: 1231,
        categoryId: 1325,
        voucherId: 1325,
        createdAt: '2025-01-18T10:30:00Z',
        updatedAt: '2025-01-18T10:30:00Z',
      },
    },
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
    schema: {
      type: 'object',
      required: [
        'name',
        'price',
        'stockKeepingUnit',
        'stock',
        'createByUserId',
      ],
      properties: {
        name: {
          type: 'string',
          example: 'Sample product name',
        },
        description: {
          type: 'string',
          example: 'Sample product description',
        },
        price: {
          type: 'number',
          example: 12,
        },
        stockKeepingUnit: {
          type: 'string',
          example: 'ADSFDSAF1463218FA',
        },
        stock: {
          type: 'number',
          example: 25,
        },
        createByUserId: {
          type: 'number',
          example: 1231,
        },
        categoryId: {
          type: 'number',
          example: 1325,
        },
        voucherId: {
          type: 'number',
          example: 1325,
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Product image files',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Sample product name' },
          description: {
            type: 'string',
            example: 'Sample product description',
          },
          price: { type: 'number', example: 12 },
          stockKeepingUnit: { type: 'string', example: 'ADSFDSAF1463218FA' },
          stock: { type: 'number', example: 25 },
          createByUserId: { type: 'number', example: 1231 },
          categoryId: { type: 'number', nullable: true, example: 1325 },
          voucherId: { type: 'number', nullable: true, example: 1325 },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-18T10:30:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-18T10:30:00Z',
          },
          productVariants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                productId: { type: 'number' },
                variantName: { type: 'string' },
                price: { type: 'number' },
                stock: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                media: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      productVariantId: { type: 'number' },
                      mediaType: { type: 'string', enum: ['IMAGE', 'VIDEO'] },
                      mediaPath: {
                        type: 'string',
                        example: 'https://cdn.example.com/product.jpg',
                      },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
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
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Sample product name' },
        description: { type: 'string', example: 'Sample product description' },
        price: { type: 'number', example: 12 },
        stockKeepingUnit: { type: 'string', example: 'ADSFDSAF1463218FA' },
        stock: { type: 'number', example: 25 },
        createByUserId: { type: 'number', example: 1231 },
        categoryId: { type: 'number', nullable: true, example: 1325 },
        voucherId: { type: 'number', nullable: true, example: 1325 },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-01-18T10:30:00Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-01-18T10:30:00Z',
        },
        productVariants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              productId: { type: 'number' },
              variantName: { type: 'string' },
              price: { type: 'number' },
              stock: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              media: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    productVariantId: { type: 'number' },
                    mediaType: { type: 'string', enum: ['IMAGE', 'VIDEO'] },
                    mediaPath: {
                      type: 'string',
                      example: 'https://cdn.example.com/product.jpg',
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
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
  @ApiResponse({ status: 200, description: 'Update one product' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          productId: { type: 'number', example: 1 },
          variantName: { type: 'string', example: 'Red - Medium' },
          price: { type: 'number', example: 12.99 },
          stock: { type: 'number', example: 50 },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-18T10:30:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-18T10:30:00Z',
          },
          media: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                productVariantId: { type: 'number' },
                mediaType: { type: 'string', enum: ['IMAGE', 'VIDEO'] },
                mediaPath: {
                  type: 'string',
                  example: 'https://cdn.example.com/variant-red-medium.jpg',
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
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
    description: 'Get all reviews of this product',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
