import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SizeProfilesService } from './size-profiles.service';
import { CreateSizeProfileDto } from './dto/create-size-profile.dto';
import { UpdateSizeProfileDto } from './dto/update-size-profile.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@/decorator/customize';
import { SizeProfileEntity } from './entities/size-profile.entity';

@Controller('size-profiles')
export class SizeProfilesController {
  constructor(private readonly sizeProfilesService: SizeProfilesService) {}

  @ApiOperation({ summary: 'Create a new size profile' })
  @ApiResponse({
    status: 201,
    description: 'Create a new size profile',
    type: SizeProfileEntity,
  })
  @ApiBody({ type: CreateSizeProfileDto })
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
  @Public()
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
  @Public()
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
  @ApiBody({ type: UpdateSizeProfileDto })
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
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.sizeProfilesService.remove(+id);
  }
}
