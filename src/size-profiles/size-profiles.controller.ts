import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SizeProfilesService } from './size-profiles.service';
import { CreateSizeProfileDto } from './dto/create-size-profile.dto';
import { UpdateSizeProfileDto } from './dto/update-size-profile.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Roles } from '@/decorator/customize';
import { SizeProfileEntity } from './entities/size-profile.entity';
import { RolesGuard } from '@/auth/passport/permission.guard';

@Controller('size-profiles')
export class SizeProfilesController {
  constructor(private readonly sizeProfilesService: SizeProfilesService) {}

  @ApiOperation({ summary: 'Create a new size profile' })
  @ApiResponse({
    status: 201,
    description: 'Create a new size profile',
    type: SizeProfileEntity,
  })
  @ApiBody({
    description: 'Size profile creation data',
    type: CreateSizeProfileDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Post()
  async create(@Body() createSizeProfileDto: CreateSizeProfileDto) {
    return await this.sizeProfilesService.create(createSizeProfileDto);
  }

  @ApiOperation({ summary: 'Get all size profiles' })
  @ApiResponse({
    status: 200,
    description: 'Get all size profiles',
    type: [SizeProfileEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.sizeProfilesService.findAll(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get one size profile' })
  @ApiResponse({
    status: 200,
    description: 'Get one size profile',
    type: SizeProfileEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.sizeProfilesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one size profile' })
  @ApiResponse({
    status: 200,
    description: 'Update one size profile',
    type: SizeProfileEntity,
  })
  @ApiBody({
    description: 'Size profile update data',
    type: UpdateSizeProfileDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateSizeProfileDto: UpdateSizeProfileDto,
  ) {
    return await this.sizeProfilesService.update(+id, updateSizeProfileDto);
  }

  @ApiOperation({ summary: 'Delete one size profile' })
  @ApiResponse({
    status: 200,
    description: 'Delete one size profile',
    type: SizeProfileEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.sizeProfilesService.remove(+id);
  }
}
