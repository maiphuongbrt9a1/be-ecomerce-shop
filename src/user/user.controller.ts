import { UserService } from '@/user/user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from '@/user/dtos/create.user.dto';
import { UpdateUserDto } from '@/user/dtos/update.user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get user list' })
  @ApiResponse({ status: 200, description: 'User list found!' })
  @Get('/')
  async getAllUsers(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.userService.getAllUser(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get user detail by ID' })
  @ApiResponse({ status: 200, description: 'User found!' })
  @Get('/:id')
  async getUserDetailById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getUserDetail(id);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @Delete('/:id')
  async deleteUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteAnUser(id);
  }

  @ApiOperation({ summary: 'Add a new user' })
  @ApiBody({ type: CreateUserDto })
  @Post('/user')
  async createAnUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createAnUser(createUserDto);
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiBody({ type: UpdateUserDto })
  @Put('/:id')
  async updateAnUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateAnUser(id, updateUserDto);
  }
}
