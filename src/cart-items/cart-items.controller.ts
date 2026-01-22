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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import { CartItemEntity } from './entities/cart-item.entity';
import { CartItemWithVariantEntity } from './entities/cart-item-with-variant.entity';

@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @ApiOperation({ summary: 'Create a new cart item' })
  @ApiBody({
    description: 'Cart item data with product variant and quantity information',
    type: CreateCartItemDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Cart item created successfully',
    type: CartItemWithVariantEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Post()
  async create(@Body() createCartItemDto: CreateCartItemDto) {
    return await this.cartItemsService.create(createCartItemDto);
  }

  @ApiOperation({ summary: 'Get all cart items' })
  @ApiResponse({
    status: 200,
    description:
      'List of cart items with product variant and media information',
    type: [CartItemWithVariantEntity],
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
    return await this.cartItemsService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get one cart item' })
  @ApiResponse({
    status: 200,
    description: 'Cart item with product variant and media information',
    type: CartItemWithVariantEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.cartItemsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one cart item' })
  @ApiBody({
    description: 'Cart item update data with optional fields',
    type: UpdateCartItemDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated successfully',
    type: CartItemWithVariantEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return await this.cartItemsService.update(+id, updateCartItemDto);
  }

  @ApiOperation({ summary: 'Delete one cart item' })
  @ApiResponse({
    status: 200,
    description: 'Delete one cart item',
    type: CartItemEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.cartItemsService.remove(+id);
  }
}
