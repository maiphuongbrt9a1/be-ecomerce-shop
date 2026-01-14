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
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles, Public } from '@/decorator/customize';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { ReviewEntity } from '@/reviews/entities/review.entity';
import { MediaEntity } from '@/media/entities/media.entity';
import type { RequestWithUserInJWTStrategy } from '@/helpers/auth/interfaces/RequestWithUser.interface';

@Controller('product-variants')
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @ApiOperation({ summary: 'Create a new product variant' })
  @ApiResponse({
    status: 201,
    description: 'Create a new product variant',
    type: ProductVariantEntity,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
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

  @ApiOperation({ summary: 'Get all product variant' })
  @ApiResponse({
    status: 200,
    description: 'Get all product variant',
    type: [ProductVariantEntity],
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
    description: 'Get one product variant',
    type: ProductVariantEntity,
  })
  @Public()
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.productVariantsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a product variant' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Product variant image files',
        },
        productId: { type: 'number', example: 1315 },
        variantName: { type: 'string', example: 'name of product variant' },
        variantColor: { type: 'string', example: 'red' },
        variantSize: { type: 'string', example: 'XL' },
        price: { type: 'number', example: 46546 },
        stock: { type: 'number', example: 851 },
        stockKeepingUnit: { type: 'string', example: 'EWDGDSED715545D' },
        voucherId: { type: 'number', example: 1325 },
        mediaIdsToDelete: {
          type: 'array',
          items: {
            type: 'string',
            format: 'int64',
            example: '9007199254740993',
          },
          description:
            'Array of media ids to delete. Big integers should be sent as strings.',
        },
        updatedAt: { type: 'string', format: 'date-time' },
      },
      required: [],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Update a product variant',
    type: ProductVariantEntity,
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
    description: 'Delete a product variant',
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
    description: 'Get all reviews of product variant',
    type: [ReviewEntity],
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

  @ApiOperation({ summary: 'Get all medias of product variant' })
  @ApiResponse({
    status: 200,
    description: 'Get all medias of product variant',
    type: [MediaEntity],
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
