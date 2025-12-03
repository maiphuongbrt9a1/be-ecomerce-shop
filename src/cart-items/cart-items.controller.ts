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
import { CartItemsService } from './cart-items.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';

@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @ApiOperation({ summary: 'Create a new cart item' })
  @ApiResponse({ status: 201, description: 'Create a new cart item' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @ApiBody({ type: CreateCartItemDto })
  @Post()
  async create(@Body() createCartItemDto: CreateCartItemDto) {
    return await this.cartItemsService.create(createCartItemDto);
  }

  @ApiOperation({ summary: 'Get all cart items' })
  @ApiResponse({ status: 200, description: 'Get all cart items' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.cartItemsService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get one cart item' })
  @ApiResponse({ status: 200, description: 'Get one cart item' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.cartItemsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one cart item' })
  @ApiResponse({ status: 200, description: 'Update one cart item' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @ApiBody({ type: UpdateCartItemDto })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return await this.cartItemsService.update(+id, updateCartItemDto);
  }

  @ApiOperation({ summary: 'Delete one cart item' })
  @ApiResponse({ status: 200, description: 'Delete one cart item' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.cartItemsService.remove(+id);
  }
}
