import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CategoryMappingService } from './category-mapping.service';
import { CreateCategoryMappingDto } from './dto/create-category-mapping.dto';
import { UpdateCategoryMappingDto } from './dto/update-category-mapping.dto';
import { SyncCategoryMappingDto } from './dto/sync-category-mapping.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import { CategoryMappingEntity } from './entities/category-mapping.entity';

@Controller('category-mapping')
export class CategoryMappingController {
  constructor(
    private readonly categoryMappingService: CategoryMappingService,
  ) {}

  @ApiOperation({ summary: 'Create a new category mapping' })
  @ApiResponse({
    status: 201,
    description: 'Create a new category mapping',
    type: CategoryMappingEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({
    description: 'CategoryMapping creation data',
    type: CreateCategoryMappingDto,
  })
  @Post()
  async create(@Body() createCategoryMappingDto: CreateCategoryMappingDto) {
    return await this.categoryMappingService.create(createCategoryMappingDto);
  }

  @ApiOperation({ summary: 'Get all category mappings' })
  @ApiResponse({
    status: 200,
    description: 'Get all category mappings',
    type: [CategoryMappingEntity],
  })
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
  @ApiQuery({
    name: 'baseCategoryId',
    required: false,
    type: Number,
    example: 3,
    description:
      'Optional base category id to filter outgoing mappings for one category',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
    @Query('baseCategoryId') baseCategoryId?: string,
  ) {
    return await this.categoryMappingService.findAll(
      Number(page),
      Number(perPage),
      baseCategoryId ? Number(baseCategoryId) : undefined,
    );
  }

  @ApiOperation({
    summary:
      'Get outgoing mapping counts grouped by base category (for admin UI badges)',
  })
  @ApiResponse({
    status: 200,
    description: 'Per-base-category count of outgoing mappings',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('/counts')
  async counts() {
    return await this.categoryMappingService.getCounts();
  }

  @ApiOperation({
    summary:
      'Replace all outgoing mappings for one base category atomically; optionally also sync reverse mappings',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated outgoing list after sync',
    type: [CategoryMappingEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({
    description: 'CategoryMapping sync data',
    type: SyncCategoryMappingDto,
  })
  @Put('/sync')
  async sync(@Body() dto: SyncCategoryMappingDto) {
    return await this.categoryMappingService.sync(dto);
  }

  @ApiOperation({ summary: 'Get a category mapping' })
  @ApiResponse({
    status: 200,
    description: 'Get a category mapping',
    type: CategoryMappingEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.categoryMappingService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a category mapping' })
  @ApiResponse({
    status: 200,
    description: 'Update a category mapping',
    type: CategoryMappingEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({
    description: 'CategoryMapping update data',
    type: UpdateCategoryMappingDto,
  })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryMappingDto: UpdateCategoryMappingDto,
  ) {
    return await this.categoryMappingService.update(
      +id,
      updateCategoryMappingDto,
    );
  }

  @ApiOperation({ summary: 'Delete a category mapping' })
  @ApiResponse({
    status: 200,
    description: 'Delete a category mapping',
    type: CategoryMappingEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.categoryMappingService.remove(+id);
  }
}
