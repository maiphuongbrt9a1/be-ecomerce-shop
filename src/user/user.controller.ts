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
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  CreateUserByGoogleAccountDto,
  CreateUserWithFileDto,
} from '@/user/dtos/create.user.dto';
import { UpdateUserWithFileDto } from '@/user/dtos/update.user.dto';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Public, Roles } from '@/decorator/customize';
import { CreateCartDto } from '@/cart/dto/create-cart.dto';
import { UpdateCartDto } from '@/cart/dto/update-cart.dto';
import { CreateCartItemDto } from '@/cart-items/dto/create-cart-item.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductWithVariantsAndMediaEntity } from '@/products/entities/product-with-variants-and-media.entity';
import { ProductVariantWithMediaEntity } from '@/product-variants/entities/product-variant-with-media.entity';
import { CategoryEntity } from '@/category/entities/category.entity';
import { OrderFullInformationEntity } from '@/orders/entities/order-full-information.entity';
import { ShipmentEntity } from '@/shipments/entities/shipment.entity';
import { RequestWithMediaEntity } from '@/requests/entities/request-with-media.entity';
import { SizeProfileEntity } from '@/size-profiles/entities/size-profile.entity';
import { ReviewWithMediaEntity } from '@/reviews/entities/review-with-media.entity';
import { CartEntity } from '@/cart/entities/cart.entity';
import { CartDetailEntity } from '@/cart/entities/cart-detail.entity';
import { UserSavedVoucherDetailEntity } from '@/user-vouchers/entities/user-saved-voucher-detail.entity';
import { UserWithMediaEntity } from './entities/user-with-media.entity';
import { UserEntity } from './entities/user.entity';
import { AddressEntity } from '@/address/entities/address.entity';
import { ShopOfficeEntity } from '@/shop-offices/entities/shop-office.entity';
import { VoucherEntity } from '@/vouchers/entities/voucher.entity';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get user list' })
  @ApiResponse({
    status: 200,
    description: 'User list retrieved successfully',
    type: [UserWithMediaEntity],
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid pagination parameters or failed to retrieve users',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have ADMIN or OPERATOR role',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'OPERATOR') // please check role is in Role enum of prisma schema
  @Get()
  async getAllUsers(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.userService.getAllUser(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get user detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found!',
    type: UserWithMediaEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'User ID',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'USER', 'OPERATOR') // please check role is in Role enum of prisma schema
  @Get('/:id')
  async getUserDetailById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getUserDetail(id);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: UserEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid user ID or unable to delete',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to delete user',
  })
  @ApiResponse({ status: 404, description: 'Not Found - User does not exist' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'USER', 'OPERATOR') // please check role is in Role enum of prisma schema
  @Delete('/:id')
  async deleteUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.deleteAnUser(id);
  }

  @ApiOperation({ summary: 'Add a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserWithMediaEntity,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid input, missing fields, or email already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN can create users',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Related resource (role/department) not found',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN') // please check role is in Role enum of prisma schema
  @ApiBody({
    description: 'User creation data with avatar file',
    type: CreateUserWithFileDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async createAnUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserWithFileDto: CreateUserWithFileDto,
  ) {
    return await this.userService.createAnUser(file, createUserWithFileDto);
  }

  @ApiOperation({ summary: 'Add a new user by Google account' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully from Google account',
    type: UserEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid Google data or email already exists',
  })
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
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserWithMediaEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input or file upload failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to update user',
  })
  @ApiResponse({ status: 404, description: 'Not Found - User does not exist' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'USER', 'OPERATOR') // please check role is in Role enum of prisma schema
  @ApiBody({
    description: 'User update data with optional avatar file',
    type: UpdateUserWithFileDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  @Patch('/:id')
  async updateAnUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserWithFileDto: UpdateUserWithFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.userService.updateAnUser(id, updateUserWithFileDto, file);
  }

  @ApiOperation({ summary: 'Get address list of a user' })
  @ApiResponse({
    status: 200,
    description: 'User address list retrieved successfully',
    type: [AddressEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User does not exist',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
  })
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
  @ApiResponse({
    status: 200,
    description: 'User shop office retrieved successfully',
    type: ShopOfficeEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN/OPERATOR can access',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User or shop office not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
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
    description: 'User avatar retrieved successfully',
    schema: {
      type: 'string',
      example: 'https://example.com/path/to/avatar.jpg',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token required for some cases',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User or avatar not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @Public()
  @Get('/:id/avatar')
  async getAvatarOfUser(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getAvatarOfUser(id);
  }

  @ApiOperation({ summary: 'Get all vouchers created by user' })
  @ApiResponse({
    status: 200,
    description: 'Vouchers created by user retrieved successfully',
    type: [VoucherEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN/OPERATOR can view',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
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

  @ApiOperation({ summary: 'Get all products created by user' })
  @ApiResponse({
    status: 200,
    description: 'Products created by user retrieved successfully',
    type: [ProductWithVariantsAndMediaEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN/OPERATOR can view',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
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

  @ApiOperation({ summary: 'Get all product variants created by user' })
  @ApiResponse({
    status: 200,
    description: 'Product variants created by user retrieved successfully',
    type: [ProductVariantWithMediaEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN/OPERATOR can view',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
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

  @ApiOperation({ summary: 'Get all categories created by user' })
  @ApiResponse({
    status: 200,
    description: 'Categories created by user retrieved successfully',
    type: [CategoryEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN/OPERATOR can view',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
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

  @ApiOperation({ summary: 'Get all orders created by user' })
  @ApiResponse({
    status: 200,
    description: 'Orders created by user retrieved successfully',
    type: [OrderFullInformationEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only customer can view their orders',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
  })
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

  @ApiOperation({ summary: 'Get all orders processed by user' })
  @ApiResponse({
    status: 200,
    description: 'Orders processed by user retrieved successfully',
    type: [OrderFullInformationEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN/OPERATOR can view processed orders',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
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

  @ApiOperation({ summary: 'Get all shipments processed by user' })
  @ApiResponse({
    status: 200,
    description: 'Shipments processed by user retrieved successfully',
    type: [ShipmentEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN/OPERATOR can view',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
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

  @ApiOperation({ summary: 'Get all requests of user' })
  @ApiResponse({
    status: 200,
    description: 'User requests retrieved successfully',
    type: [RequestWithMediaEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only view own requests',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
  })
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

  @ApiOperation({ summary: 'Get all requests processed by user' })
  @ApiResponse({
    status: 200,
    description: 'Processed requests retrieved successfully',
    type: [RequestWithMediaEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN/OPERATOR can view',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
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

  @ApiOperation({ summary: 'Get all size profiles of user' })
  @ApiResponse({
    status: 200,
    description: 'Size profiles retrieved successfully',
    type: [SizeProfileEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only view own size profiles',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
  })
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

  @ApiOperation({ summary: 'Get all reviews of user' })
  @ApiResponse({
    status: 200,
    description: 'User reviews retrieved successfully',
    type: [ReviewWithMediaEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only view own reviews',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
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
    description: 'Cart created successfully',
    type: CartEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid cart data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only USER can create cart',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
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
    description: 'Cart item added successfully',
    type: CartDetailEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid cart item data or insufficient stock',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only USER can add to cart',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Cart or product variant not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @ApiBody({ type: CreateCartItemDto })
  @Post('/:id/cart/cart-item')
  async AddANewCart(@Body() createCartItemDto: CreateCartItemDto) {
    return await this.userService.AddANewCart(createCartItemDto);
  }

  @ApiOperation({
    summary: 'Get cart of user (only get cart info. Do not get any cart items)',
  })
  @ApiResponse({
    status: 200,
    description: 'User cart retrieved successfully',
    type: CartEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only view own cart',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Cart not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
  @Get('/:id/cart')
  async getCartIdOfUser(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getCartIdOfUser(id);
  }

  @ApiOperation({
    summary:
      'Update user cart (only update cart info. Do not modify any cart items)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart updated successfully',
    type: CartEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid cart data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only USER can update own cart',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Cart not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
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

  @ApiOperation({ summary: 'Get user cart with all cart items details' })
  @ApiResponse({
    status: 200,
    description: 'User cart with items retrieved successfully',
    type: CartDetailEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only view own cart',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Cart not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Get('/:id/cart/cart-details')
  async getUserCartDetails(@Param('id') id: string) {
    return await this.userService.getUserCartDetails(+id);
  }

  @ApiOperation({ summary: 'Get all saved vouchers of user' })
  @ApiResponse({
    status: 200,
    description: 'Saved vouchers retrieved successfully',
    type: [UserSavedVoucherDetailEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only view own saved vouchers',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (default 10)',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER', 'OPERATOR')
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
