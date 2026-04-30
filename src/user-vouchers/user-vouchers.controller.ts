import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RequestWithUserInJWTStrategy } from '@/helpers/auth/interfaces/RequestWithUser.interface';
import { UserVouchersService } from './user-vouchers.service';
import { CreateUserVoucherDto } from './dto/create-user-voucher.dto';
import { UpdateUserVoucherDto } from './dto/update-user-voucher.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { UserVoucherEntity } from './entities/user-voucher.entity';
import { UserSavedVoucherDetailEntity } from './entities/user-saved-voucher-detail.entity';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';

@Controller('user-vouchers')
export class UserVouchersController {
  constructor(private readonly userVouchersService: UserVouchersService) {}

  @ApiOperation({ summary: 'Create a new user voucher' })
  @ApiBody({
    description: 'User voucher data with voucher ID and user ID information',
    type: CreateUserVoucherDto,
  })
  @ApiResponse({
    status: 201,
    description: 'User voucher created successfully',
    type: UserSavedVoucherDetailEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN')
  @Post()
  async create(@Body() createUserVoucherDto: CreateUserVoucherDto) {
    return await this.userVouchersService.create(createUserVoucherDto);
  }

  @ApiOperation({ summary: 'Get all user vouchers' })
  @ApiResponse({
    status: 200,
    description: 'User vouchers retrieved successfully',
    type: [UserSavedVoucherDetailEntity],
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
  @Roles('USER')
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.userVouchersService.findAll(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get all vouchers for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User vouchers retrieved successfully',
    type: [UserSavedVoucherDetailEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @Get('/me')
  async findMine(
    @Req() req: RequestWithUserInJWTStrategy,
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
  ) {
    return await this.userVouchersService.findByUserId(
      Number(req.user.userId),
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get one user voucher' })
  @ApiResponse({
    status: 200,
    description: 'User voucher retrieved successfully',
    type: UserSavedVoucherDetailEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.userVouchersService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one user voucher' })
  @ApiBody({
    description:
      'User voucher update data with optional status and usage information',
    type: UpdateUserVoucherDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User voucher updated successfully',
    type: UserSavedVoucherDetailEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
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
    description: 'User voucher deleted successfully',
    type: UserVoucherEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.userVouchersService.remove(+id);
  }
}
