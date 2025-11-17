import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { SizeProfilesService } from './size-profiles.service';
import { CreateSizeProfileDto } from './dto/create-size-profile.dto';
import { UpdateSizeProfileDto } from './dto/update-size-profile.dto';

@Controller('size-profiles')
export class SizeProfilesController {
  constructor(private readonly sizeProfilesService: SizeProfilesService) {}

  @Post()
  create(@Body() createSizeProfileDto: CreateSizeProfileDto) {
    return this.sizeProfilesService.create(createSizeProfileDto);
  }

  @Get()
  findAll() {
    return this.sizeProfilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sizeProfilesService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSizeProfileDto: UpdateSizeProfileDto,
  ) {
    return this.sizeProfilesService.update(+id, updateSizeProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sizeProfilesService.remove(+id);
  }
}
