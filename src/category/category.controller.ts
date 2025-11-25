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
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Create a new category' })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({ type: CreateCategoryDto })
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.create(createCategoryDto);
  }

  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Get all categories' })
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.categoryService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get a category' })
  @ApiResponse({ status: 200, description: 'Get a category' })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.categoryService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 201, description: 'Update a category' })
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
  @ApiResponse({ status: 201, description: 'Delete a category' })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.categoryService.remove(+id);
  }

  @ApiOperation({ summary: 'Get all sub-category of category' })
  @ApiResponse({ status: 200, description: 'Get all sub-category of category' })
  @Get('/:id/sub-categories')
  async getAllSubCategoriesOfCategory(@Param('id') id: string) {
    return await this.categoryService.getAllSubCategoriesOfCategory(+id);
  }
}
