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
import { UserVouchersService } from './user-vouchers.service';
import { CreateUserVoucherDto } from './dto/create-user-voucher.dto';
import { UpdateUserVoucherDto } from './dto/update-user-voucher.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserVoucherEntity } from './entities/user-voucher.entity';

@Controller('user-vouchers')
export class UserVouchersController {
  constructor(private readonly userVouchersService: UserVouchersService) {}

  @ApiOperation({ summary: 'Create a new user voucher' })
  @ApiResponse({
    status: 201,
    description: 'Create a new user voucher',
    type: UserVoucherEntity,
  })
  @ApiBody({ type: CreateUserVoucherDto })
  @Post()
  async create(@Body() createUserVoucherDto: CreateUserVoucherDto) {
    return await this.userVouchersService.create(createUserVoucherDto);
  }

  @ApiOperation({ summary: 'Get all user vouchers' })
  @ApiResponse({
    status: 200,
    description: 'Get all user vouchers',
    type: [UserVoucherEntity],
  })
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.userVouchersService.findAll(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get one user voucher' })
  @ApiResponse({
    status: 200,
    description: 'Get one user voucher',
    type: UserVoucherEntity,
  })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.userVouchersService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one user voucher' })
  @ApiResponse({
    status: 200,
    description: 'Update one user voucher',
    type: UserVoucherEntity,
  })
  @ApiBody({ type: UpdateUserVoucherDto })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUserVoucherDto: UpdateUserVoucherDto,
  ) {
    return await this.userVouchersService.update(+id, updateUserVoucherDto);
  }

  @ApiOperation({ summary: 'Delete one user voucher' })
  @ApiResponse({
    status: 200,
    description: 'Delete one user voucher',
    type: UserVoucherEntity,
  })
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.userVouchersService.remove(+id);
  }
}
