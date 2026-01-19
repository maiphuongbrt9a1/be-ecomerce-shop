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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles, Public } from '@/decorator/customize';
import { CategoryEntity } from './entities/category.entity';
import { ProductEntity } from '@/products/entities/product.entity';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Create a new category',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({ type: CreateCategoryDto })
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.create(createCategoryDto);
  }

  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Get all categories',
    type: [CategoryEntity],
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
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
    return await this.categoryService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get a category' })
  @ApiResponse({
    status: 200,
    description: 'Get a category',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Public()
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.categoryService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({
    status: 200,
    description: 'Update a category',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({ type: UpdateCategoryDto })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(+id, updateCategoryDto);
  }

  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({
    status: 200,
    description: 'Delete a category',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.categoryService.remove(+id);
  }

  @ApiOperation({ summary: 'Get all sub-category of category' })
  @ApiResponse({
    status: 200,
    description: 'Get all sub-category of category',
    type: [CategoryEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @Public()
  @Get('/:id/sub-categories')
  async getAllSubCategoriesOfCategory(@Param('id') id: string) {
    return await this.categoryService.getAllSubCategoriesOfCategory(+id);
  }

  @ApiOperation({ summary: 'Get all products of category' })
  @ApiResponse({
    status: 200,
    description: 'Get all products of category',
    type: [ProductEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @Public()
  @Get('/:id/products')
  async getAllProductsOfCategory(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.categoryService.getAllProductsOfCategory(
      +id,
      Number(page),
      Number(perPage),
    );
  }
}
