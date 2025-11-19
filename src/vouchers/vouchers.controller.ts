import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @ApiOperation({ summary: 'Create a new voucher' })
  @ApiResponse({ status: 201, description: 'Create a new voucher' })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({ type: CreateVoucherDto })
  @Post()
  async create(@Body() createVoucherDto: CreateVoucherDto) {
    return await this.vouchersService.create(createVoucherDto);
  }

  @ApiOperation({ summary: 'Get all vouchers' })
  @ApiResponse({ status: 200, description: 'Get all vouchers' })
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.vouchersService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get a voucher' })
  @ApiResponse({ status: 200, description: 'Get a voucher' })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.vouchersService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a voucher' })
  @ApiResponse({ status: 200, description: 'Update a voucher' })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBody({ type: UpdateVoucherDto })
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ) {
    return await this.vouchersService.update(+id, updateVoucherDto);
  }

  @ApiOperation({ summary: 'Delete a voucher' })
  @ApiResponse({ status: 200, description: 'Delete a voucher' })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.vouchersService.remove(+id);
  }
}
