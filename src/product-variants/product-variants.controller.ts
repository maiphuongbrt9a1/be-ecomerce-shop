import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles, Public } from '@/decorator/customize';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { ProductVariantWithMediaEntity } from './entities/product-variant-with-media.entity';
import { MediaEntity } from '@/media/entities/media.entity';
import { ReviewWithMediaEntity } from '@/reviews/entities/review-with-media.entity';
import type { RequestWithUserInJWTStrategy } from '@/helpers/auth/interfaces/RequestWithUser.interface';

@Controller('product-variants')
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @ApiOperation({ summary: 'Create a new product variant' })
  @ApiResponse({
    status: 201,
    description:
      'Product variant created successfully with uploaded media files',
    type: ProductVariantWithMediaEntity,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product variant creation data with image files',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Product variant image files',
        },
        productId: { type: 'number', example: 1315 },
        createByUserId: { type: 'number', example: 852 },
        variantName: { type: 'string', example: 'name of product variant' },
        variantColor: { type: 'string', example: 'red' },
        variantSize: { type: 'string', example: 'XL' },
        variantWeight: {
          type: 'number',
          example: 1.5,
          description: 'in grams',
        },
        variantHeight: { type: 'number', example: 10, description: 'in cm' },
        variantLength: { type: 'number', example: 20, description: 'in cm' },
        variantWidth: { type: 'number', example: 15, description: 'in cm' },
        colorId: {
          type: 'number',
          example: 1,
          description: 'Color ID from Color model',
        },
        price: { type: 'number', example: 46546 },
        stock: { type: 'number', example: 851 },
        stockKeepingUnit: { type: 'string', example: 'EWDGDSED715545D' },
        voucherId: { type: 'number', example: 1325 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
      required: [
        'files',
        'productId',
        'createByUserId',
        'variantName',
        'variantColor',
        'variantSize',
        'price',
        'stock',
        'stockKeepingUnit',
        'colorId',
        'createdAt',
      ],
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  @Post()
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductVariantDto: CreateProductVariantDto,
    @Request() req: RequestWithUserInJWTStrategy,
  ) {
    return await this.productVariantsService.create(
      files,
      createProductVariantDto,
      req.user.userId.toString(),
    );
  }

  @ApiOperation({ summary: 'Get all product variants' })
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
  @ApiResponse({
    status: 200,
    description:
      'Retrieved all product variants with media information successfully',
    type: [ProductVariantWithMediaEntity],
  })
  @Public()
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.productVariantsService.findAll(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get one product variant' })
  @ApiResponse({
    status: 200,
    description:
      'Retrieved product variant with media information successfully',
    type: ProductVariantWithMediaEntity,
  })
  @Public()
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.productVariantsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a product variant' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Product variant update data with optional image files and media IDs to delete',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Product variant image files to upload',
        },
        productId: { type: 'number', example: 1315 },
        variantName: { type: 'string', example: 'name of product variant' },
        variantColor: { type: 'string', example: 'red' },
        variantSize: { type: 'string', example: 'XL' },
        variantWeight: {
          type: 'number',
          example: 1.5,
          description: 'in grams',
        },
        variantHeight: { type: 'number', example: 10, description: 'in cm' },
        variantLength: { type: 'number', example: 20, description: 'in cm' },
        variantWidth: { type: 'number', example: 15, description: 'in cm' },
        price: { type: 'number', example: 46546 },
        stock: { type: 'number', example: 851 },
        stockKeepingUnit: { type: 'string', example: 'EWDGDSED715545D' },
        colorId: {
          type: 'number',
          example: 1,
          description: 'Color ID from Color model',
        },
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
        updatedAt: { type: 'string', format: 'date-time' },
      },
      required: [],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Product variant updated successfully with new media files',
    type: ProductVariantWithMediaEntity,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('/:id')
  @UseInterceptors(FilesInterceptor('files', 10))
  async update(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('id') id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
    @Request() req: RequestWithUserInJWTStrategy,
  ) {
    return await this.productVariantsService.update(
      files,
      +id,
      updateProductVariantDto,
      req.user.userId.toString(),
    );
  }

  @ApiOperation({ summary: 'Delete a product variant' })
  @ApiResponse({
    status: 200,
    description:
      'Product variant deleted successfully with all associated media files',
    type: ProductVariantEntity,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.productVariantsService.remove(+id);
  }

  @ApiOperation({ summary: 'Get all reviews of product variant' })
  @ApiResponse({
    status: 200,
    description:
      'Retrieved all reviews for the product variant with media information successfully',
    type: [ReviewWithMediaEntity],
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
  @Get('/:id/review-list')
  async getReviewsOfProductVariant(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.productVariantsService.getReviewsOfProductVariant(
      +id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get all media of product variant' })
  @ApiResponse({
    status: 200,
    description:
      'Retrieved all media files for the product variant successfully',
    type: [MediaEntity],
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
  @Get('/:id/media-list')
  async getAllMediaOfProductVariant(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.productVariantsService.getAllMediaOfProductVariant(
      +id,
      Number(page),
      Number(perPage),
    );
  }
}
