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
  UploadedFile,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('product-variants')
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @ApiOperation({ summary: 'Create a new product variant' })
  @ApiResponse({ status: 201, description: 'Create a new product variant' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({ type: CreateProductVariantDto })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductVariantDto: CreateProductVariantDto,
    @Request() req,
  ) {
    return await this.productVariantsService.create(
      file,
      createProductVariantDto,
      req.user.userId,
    );
  }

  @ApiOperation({ summary: 'Get all product variant' })
  @ApiResponse({ status: 200, description: 'Get all product variant' })
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.productVariantsService.findAll(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get one product variant' })
  @ApiResponse({ status: 200, description: 'Get one product variant' })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.productVariantsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a product variant' })
  @ApiResponse({ status: 200, description: 'Update a product variant' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({ type: UpdateProductVariantDto })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
  ) {
    return await this.productVariantsService.update(
      +id,
      updateProductVariantDto,
    );
  }

  @ApiOperation({ summary: 'Delete a product variant' })
  @ApiResponse({ status: 200, description: 'Delete a product variant' })
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
  })
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
  })
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
