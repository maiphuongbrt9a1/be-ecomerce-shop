import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Create a new cart' })
  @ApiResponse({ status: 201, description: 'Create a new cart' })
  @UseGuards(RolesGuard)
  @Roles('USER')
  @ApiBody({ type: CreateCartDto })
  @Post()
  async create(@Body() createCartDto: CreateCartDto) {
    return await this.cartService.create(createCartDto);
  }

  @ApiOperation({ summary: 'Get one cart' })
  @ApiResponse({ status: 200, description: 'Get one cart' })
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.cartService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one cart' })
  @ApiResponse({ status: 200, description: 'Update one cart' })
  @UseGuards(RolesGuard)
  @Roles('USER')
  @ApiBody({ type: UpdateCartDto })
  @Put('/:id')
  async update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return await this.cartService.update(+id, updateCartDto);
  }
}
