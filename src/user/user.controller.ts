import { UserService } from '@/user/user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from '@/user/dtos/create.user.dto';
import { UpdateUserDto } from '@/user/dtos/update.user.dto';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import { CreateCartDto } from '@/cart/dto/create-cart.dto';
import { UpdateCartDto } from '@/cart/dto/update-cart.dto';
import { CreateCartItemDto } from '@/cart-items/dto/create-cart-item.dto';
import { UserEntity } from './entities/user.entity';
import { AddressEntity } from '@/address/entities/address.entity';
import { ShopOfficeEntity } from '@/shop-offices/entities/shop-office.entity';
import { MediaEntity } from '@/media/entities/media.entity';
import { VoucherEntity } from '@/vouchers/entities/voucher.entity';
import { ProductEntity } from '@/products/entities/product.entity';
import { ProductVariantEntity } from '@/product-variants/entities/product-variant.entity';
import { CategoryEntity } from '@/category/entities/category.entity';
import { OrderEntity } from '@/orders/entities/order.entity';
import { ShipmentEntity } from '@/shipments/entities/shipment.entity';
import { RequestEntity } from '@/requests/entities/request.entity';
import { SizeProfileEntity } from '@/size-profiles/entities/size-profile.entity';
import { ReviewEntity } from '@/reviews/entities/review.entity';
import { CartEntity } from '@/cart/entities/cart.entity';
import { CartItemEntity } from '@/cart-items/entities/cart-item.entity';
import { UserVoucherEntity } from '@/user-vouchers/entities/user-voucher.entity';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get user list' })
  @ApiResponse({ status: 200, description: 'User list found!', type: [UserEntity] })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN') // please check role is in Role enum of prisma schema
  @Get()
  async getAllUsers(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.userService.getAllUser(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get user detail by ID' })
  @ApiResponse({ status: 200, description: 'User found!', type: UserEntity })
  @Get('/:id')
  async getUserDetailById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getUserDetail(id);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted', type: UserEntity })
  @Delete('/:id')
  async deleteUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteAnUser(id);
  }

  @ApiOperation({ summary: 'Add a new user' })
  @ApiResponse({ status: 201, description: 'User created', type: UserEntity })
  @ApiBody({ type: CreateUserDto })
  @Post()
  async createAnUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createAnUser(createUserDto);
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated', type: UserEntity })
  @ApiBody({ type: UpdateUserDto })
  @Patch('/:id')
  async updateAnUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateAnUser(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Get address list of a user' })
  @ApiResponse({ status: 200, description: 'User address list found!', type: [AddressEntity] })
  @Get('/:id/address-list')
  async getAddressOfUser(
    @Param('id', ParseIntPipe) userId: number,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.userService.getAddressOfUser(
      userId,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get shop office of a user' })
  @ApiResponse({ status: 200, description: 'User shop office found!', type: ShopOfficeEntity })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'OPERATOR') // please check role is in Role enum of prisma schema
  @Get('/:id/shop-office')
  async getShopOfficeOfUser(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getShopOfficeOfUser(id);
  }

  @ApiOperation({ summary: 'Get avatar of user' })
  @ApiResponse({
    status: 200,
    description: 'Get avatar of user',
    type: MediaEntity,
  })
  @Get('/:id/avatar')
  async getAvatarOfUser(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getAvatarOfUser(id);
  }

  @ApiOperation({ summary: 'Get vouchers are created by a user' })
  @ApiResponse({
    status: 200,
    description: 'Get vouchers are created by a user',
    type: [VoucherEntity],
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'OPERATOR') // please check role is in Role enum of prisma schema
  @Get('/:id/created-voucher-list')
  async getAllVouchersCreatedByUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.userService.getAllVouchersCreatedByUser(
      id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get products are created by a user' })
  @ApiResponse({
    status: 200,
    description: 'Get products are created by a user',
    type: [ProductEntity],
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'OPERATOR') // please check role is in Role enum of prisma schema
  @Get('/:id/product-list')
  async getAllProductsCreatedByUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.userService.getAllProductsCreatedByUser(
      id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get product variants are created by a user' })
  @ApiResponse({
    status: 200,
    description: 'Get product variants are created by a user',
    type: [ProductVariantEntity],
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'OPERATOR') // please check role is in Role enum of prisma schema
  @Get('/:id/product-variant-list')
  async getAllProductVariantsCreatedByUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.userService.getAllProductVariantsCreatedByUser(
      id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get categories are created by a user' })
  @ApiResponse({
    status: 200,
    description: 'Get categories are created by a user',
    type: [CategoryEntity],
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'OPERATOR') // please check role is in Role enum of prisma schema
  @Get('/:id/category-list')
  async getAllCategoryCreatedByUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.userService.getAllCategoryCreatedByUser(
      id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get orders are created by a user' })
  @ApiResponse({
    status: 200,
    description: 'Get orders are created by a user',
    type: [OrderEntity],
  })
  @Get('/:id/order-list')
  async getAllOrdersCreatedByUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.userService.getAllOrdersCreatedByUser(
      id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get orders are processed by a user' })
  @ApiResponse({
    status: 200,
    description: 'Get orders are processed by a user',
    type: [OrderEntity],
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'OPERATOR') // please check role is in Role enum of prisma schema
  @Get('/:id/processed-order-list')
  async getAllOrdersProcessedByUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.userService.getAllOrdersProcessedByUser(
      id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get shipments are processed by a user' })
  @ApiResponse({
    status: 200,
    description: 'Get shipments are processed by a user',
    type: [ShipmentEntity],
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'OPERATOR') // please check role is in Role enum of prisma schema
  @Get('/:id/processed-shipment-list')
  async getAllShipmentsProcessedByUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.userService.getAllShipmentsProcessedByUser(
      id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get requests of user' })
  @ApiResponse({
    status: 200,
    description: 'Get requests of user',
    type: [RequestEntity],
  })
  @Get('/:id/request-list')
  async getRequestsOfUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.userService.getRequestsOfUser(
      id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get processed requests of user' })
  @ApiResponse({
    status: 200,
    description: 'Get processed requests of user',
    type: [RequestEntity],
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'OPERATOR') // please check role is in Role enum of prisma schema
  @Get('/:id/processed-request-list')
  async getRequestsProcessedByUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.userService.getRequestsProcessedByUser(
      id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get size-profiles of user' })
  @ApiResponse({
    status: 200,
    description: 'Get size-profiles of user',
    type: [SizeProfileEntity],
  })
  @Get('/:id/size-profile-list')
  async getSizeProfilesOfUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.userService.getSizeProfilesOfUser(
      id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get reviews of user' })
  @ApiResponse({
    status: 200,
    description: 'Get reviews of user',
    type: [ReviewEntity],
  })
  @Get('/:id/review-list')
  async getReviewsOfUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.userService.getReviewsOfUser(
      id,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({
    summary:
      'Create a new cart (only initial id user in cart table. Do not add any cart items)',
  })
  @ApiResponse({
    status: 201,
    description:
      'Create a new cart (only initial id user in cart table. Do not add any cart items)',
    type: CartEntity,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @ApiBody({ type: CreateCartDto })
  @Post('/:id/cart')
  async createANewCart(@Body() createCartDto: CreateCartDto) {
    return await this.userService.createANewCart(createCartDto);
  }

  @ApiOperation({
    summary: 'Add a new product variant (cart item) to cart',
  })
  @ApiResponse({
    status: 201,
    description: 'Add a new product variant (cart item) to cart',
    type: CartItemEntity,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @ApiBody({ type: CreateCartItemDto })
  @Post('/:id/cart/cart-item')
  async AddANewCart(@Body() createCartItemDto: CreateCartItemDto) {
    return await this.userService.AddANewCart(createCartItemDto);
  }

  @ApiOperation({
    summary:
      'Get cart id of user (only get id user in cart table. Do not get any cart items)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Get cart id of user (only get id user in cart table. Do not get any cart items)',
    type: CartEntity,
  })
  @Get('/:id/cart')
  async getCartIdOfUser(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getCartIdOfUser(id);
  }

  @ApiOperation({
    summary:
      'Update one cart (only update id user in cart table. Do not add any cart items)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Update one cart (only update id user in cart table. Do not add any cart items)',
    type: CartEntity,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @ApiBody({ type: UpdateCartDto })
  @Patch('/:id/cart')
  async updateUserCart(
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return await this.userService.updateUserCart(+id, updateCartDto);
  }

  @ApiOperation({ summary: 'Get user cart with cart items detail' })
  @ApiResponse({
    status: 200,
    description: 'Get user cart with cart items detail',
    type: CartEntity,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Get('/:id/cart/cart-details')
  async getUserCartDetails(@Param('id') id: string) {
    return await this.userService.getUserCartDetails(+id);
  }

  @ApiOperation({ summary: 'Get saved vouchers of user' })
  @ApiResponse({
    status: 200,
    description: 'Get saved vouchers of user',
    type: [UserVoucherEntity],
  })
  @Get('/:id/saved-voucher-list')
  async getSavedVouchersOfUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return await this.userService.getSavedVouchersOfUser(
      id,
      Number(page),
      Number(perPage),
    );
  }
}
