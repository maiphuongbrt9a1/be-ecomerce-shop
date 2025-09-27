import { UserService } from './user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dtos/create.user.dto';
import { UpdateUserDto } from './dtos/update.user.dto';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private actorService: UserService) {}

  @ApiOperation({ summary: 'Get actor list' })
  @ApiResponse({ status: 201, description: '' })
  @Get('/')
  async getAllUsers() {
    return await this.actorService.getAllUser();
  }

  @ApiOperation({ summary: 'Get actor detail by ID' })
  @ApiResponse({ status: 201, description: 'User found!' })
  @Get('/:id')
  async getUserDetailById(@Param('id', ParseIntPipe) id: number) {
    return await this.actorService.getUserDetail(id);
  }

  @ApiOperation({ summary: 'Delete an actor' })
  @Delete('/:id')
  async deleteUserById(@Param('id', ParseIntPipe) id: number) {
    return this.actorService.deleteAnUser(id);
  }

  @ApiOperation({ summary: 'Add a new actor' })
  @ApiBody({ type: CreateUserDto })
  @Post('/actor')
  async createAnUser(@Body() createUserDto: CreateUserDto) {
    return await this.actorService.createAnUser(createUserDto);
  }

  @Put('/:id')
  async updateAnUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.actorService.updateAnUser(id, updateUserDto);
  }
}
