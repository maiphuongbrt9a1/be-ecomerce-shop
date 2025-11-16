import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserVouchersService } from './user-vouchers.service';
import { CreateUserVoucherDto } from './dto/create-user-voucher.dto';
import { UpdateUserVoucherDto } from './dto/update-user-voucher.dto';

@Controller('user-vouchers')
export class UserVouchersController {
  constructor(private readonly userVouchersService: UserVouchersService) {}

  @Post()
  create(@Body() createUserVoucherDto: CreateUserVoucherDto) {
    return this.userVouchersService.create(createUserVoucherDto);
  }

  @Get()
  findAll() {
    return this.userVouchersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userVouchersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserVoucherDto: UpdateUserVoucherDto) {
    return this.userVouchersService.update(+id, updateUserVoucherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userVouchersService.remove(+id);
  }
}
