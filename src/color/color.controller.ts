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
import { ColorService } from './color.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles, Public } from '@/decorator/customize';
import { ColorEntity } from './entities/color.entity';

@Controller('color')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @ApiOperation({ summary: 'Create a new color' })
  @ApiResponse({
    status: 201,
    description: 'Color created successfully',
    type: ColorEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid color data' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({
    description: 'Color creation data with name and hex code',
    type: CreateColorDto,
  })
  @Post()
  async create(@Body() createColorDto: CreateColorDto) {
    return await this.colorService.create(createColorDto);
  }

  @ApiOperation({ summary: 'Get all colors' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all colors successfully',
    type: [ColorEntity],
  })
  @ApiResponse({ status: 404, description: 'Not Found - No colors available' })
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
    return await this.colorService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get a color by ID' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved color successfully',
    type: ColorEntity,
  })
  @ApiResponse({ status: 404, description: 'Not Found - Color does not exist' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid color ID' })
  @Public()
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.colorService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a color' })
  @ApiResponse({
    status: 200,
    description: 'Color updated successfully',
    type: ColorEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid update data',
  })
  @ApiResponse({ status: 404, description: 'Not Found - Color does not exist' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({
    description: 'Color update data with optional name and hex code',
    type: UpdateColorDto,
  })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateColorDto: UpdateColorDto,
  ) {
    return await this.colorService.update(+id, updateColorDto);
  }

  @ApiOperation({ summary: 'Delete a color' })
  @ApiResponse({
    status: 200,
    description: 'Color deleted successfully',
    type: ColorEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid color ID' })
  @ApiResponse({ status: 404, description: 'Not Found - Color does not exist' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.colorService.remove(+id);
  }
}
