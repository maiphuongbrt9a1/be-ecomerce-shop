import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { UserVouchersService } from './user-vouchers.service';
import { CreateUserVoucherDto } from './dto/create-user-voucher.dto';
import { UpdateUserVoucherDto } from './dto/update-user-voucher.dto';

@Controller('user-vouchers')
export class UserVouchersController {
  constructor(private readonly userVouchersService: UserVouchersService) {}

  @Post()
  async create(@Body() createUserVoucherDto: CreateUserVoucherDto) {
    return await this.userVouchersService.create(createUserVoucherDto);
  }

  @Get()
  async findAll() {
    return await this.userVouchersService.findAll();
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.userVouchersService.findOne(+id);
  }

  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUserVoucherDto: UpdateUserVoucherDto,
  ) {
    return await this.userVouchersService.update(+id, updateUserVoucherDto);
  }

  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.userVouchersService.remove(+id);
  }
}
