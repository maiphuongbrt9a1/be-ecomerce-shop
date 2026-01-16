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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import {
  CreateUserByGoogleAccountDto,
  CreateUserDto,
} from '@/user/dtos/create.user.dto';
import { UpdateUserDto } from '@/user/dtos/update.user.dto';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Public, Roles } from '@/decorator/customize';
import { CreateCartDto } from '@/cart/dto/create-cart.dto';
import { UpdateCartDto } from '@/cart/dto/update-cart.dto';
import { CreateCartItemDto } from '@/cart-items/dto/create-cart-item.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get user list' })
  @ApiResponse({ status: 200, description: 'User list found!' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'OPERATOR') // please check role is in Role enum of prisma schema
  @Get()
  async getAllUsers(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.userService.getAllUser(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get user detail by ID' })
  @ApiResponse({ status: 200, description: 'User found!' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'USER', 'OPERATOR') // please check role is in Role enum of prisma schema
  @Get('/:id')
  async getUserDetailById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getUserDetail(id);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully!' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'USER', 'OPERATOR') // please check role is in Role enum of prisma schema
  @Delete('/:id')
  async deleteUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteAnUser(id);
  }

  @ApiOperation({ summary: 'Add a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'User created successfully!' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN') // please check role is in Role enum of prisma schema
  @ApiBody({ type: CreateUserDto })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async createAnUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    return await this.userService.createAnUser(file, createUserDto);
  }

  @ApiOperation({ summary: 'Add a new user by Google account' })
  @ApiResponse({ status: 201, description: 'User created successfully!' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Public()
  @ApiBody({ type: CreateUserByGoogleAccountDto })
  @Post('google-account')
  async createAnUserByGoogleAccount(
    @Body() createUserByGoogleAccountDto: CreateUserByGoogleAccountDto,
  ) {
    return await this.userService.createAnUserByGoogleAccount(
      createUserByGoogleAccountDto,
    );
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully!' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'USER', 'OPERATOR') // please check role is in Role enum of prisma schema
  @ApiBody({ type: UpdateUserDto })
  @Patch('/:id')
  async updateAnUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateAnUser(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Get address list of a user' })
  @ApiResponse({ status: 200, description: 'User address list found!' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'USER', 'OPERATOR') // please check role is in Role enum of prisma schema
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
  @ApiResponse({ status: 200, description: 'User shop office found!' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @Public()
  @Get('/:id/avatar')
  async getAvatarOfUser(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getAvatarOfUser(id);
  }

  @ApiOperation({ summary: 'Get vouchers are created by a user' })
  @ApiResponse({
    status: 200,
    description: 'Get vouchers are created by a user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'USER', 'OPERATOR') // please check role is in Role enum of prisma schema
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'USER', 'OPERATOR') // please check role is in Role enum of prisma schema
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'USER', 'OPERATOR') // please check role is in Role enum of prisma schema
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @Public()
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'USER', 'OPERATOR') // please check role is in Role enum of prisma schema
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'USER', 'OPERATOR') // please check role is in Role enum of prisma schema
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
