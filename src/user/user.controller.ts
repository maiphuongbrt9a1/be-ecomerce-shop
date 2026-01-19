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
  @ApiResponse({
    status: 200,
    description: 'User list retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          firstName: { type: 'string', nullable: true, example: 'John' },
          lastName: { type: 'string', nullable: true, example: 'Doe' },
          gender: {
            type: 'string',
            enum: ['MALE', 'FEMALE', 'OTHER'],
            example: 'MALE',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          phone: { type: 'string', nullable: true, example: '0123456789' },
          username: { type: 'string', example: 'johndoe' },
          googleId: {
            type: 'string',
            nullable: true,
            example: 'google-id-123',
          },
          role: {
            type: 'string',
            enum: ['USER', 'ADMIN', 'OPERATOR'],
            example: 'USER',
          },
          isActive: { type: 'boolean', example: true },
          points: { type: 'number', example: 100 },
          staffCode: { type: 'string', nullable: true, example: 'STAFF001' },
          loyaltyCard: {
            type: 'string',
            nullable: true,
            example: 'LOYALTY123',
          },
          shopOfficeId: { type: 'number', nullable: true, example: 1 },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-18T10:30:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-18T10:30:00Z',
          },
          userMedia: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                userId: { type: 'number' },
                mediaType: {
                  type: 'string',
                  enum: ['IMAGE', 'VIDEO', 'DOCUMENT'],
                },
                mediaPath: {
                  type: 'string',
                  example: 'https://cdn.example.com/avatar.jpg',
                },
                isAvatarFile: { type: 'boolean', example: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
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
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        firstName: { type: 'string', nullable: true, example: 'John' },
        lastName: { type: 'string', nullable: true, example: 'Doe' },
        gender: {
          type: 'string',
          enum: ['MALE', 'FEMALE', 'OTHER'],
          example: 'MALE',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'john.doe@example.com',
        },
        phone: { type: 'string', nullable: true, example: '0123456789' },
        username: { type: 'string', example: 'johndoe' },
        googleId: {
          type: 'string',
          nullable: true,
          example: 'google-id-123',
        },
        role: {
          type: 'string',
          enum: ['USER', 'ADMIN', 'OPERATOR'],
          example: 'USER',
        },
        isActive: { type: 'boolean', example: true },
        points: { type: 'number', example: 100 },
        staffCode: { type: 'string', nullable: true, example: 'STAFF001' },
        loyaltyCard: {
          type: 'string',
          nullable: true,
          example: 'LOYALTY123',
        },
        shopOfficeId: { type: 'number', nullable: true, example: 1 },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-01-18T10:30:00Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-01-18T10:30:00Z',
        },
        userMedia: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              userId: { type: 'number' },
              mediaType: {
                type: 'string',
                enum: ['IMAGE', 'VIDEO', 'DOCUMENT'],
              },
              mediaPath: {
                type: 'string',
                example: 'https://cdn.example.com/avatar.jpg',
              },
              isAvatarFile: { type: 'boolean', example: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
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
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'john.doe@example.com' },
        message: { type: 'string', example: 'User deleted successfully' },
      },
    },
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
    return this.userService.deleteAnUser(id);
  }

  @ApiOperation({ summary: 'Add a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'john.doe@example.com' },
        username: { type: 'string', example: 'john_doe' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        role: {
          type: 'string',
          enum: ['USER', 'ADMIN', 'OPERATOR'],
          example: 'USER',
        },
        isActive: { type: 'boolean', example: false },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
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
    description: 'User creation data with optional avatar file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'User avatar image file (optional)',
        },
        firstName: {
          type: 'string',
          example: 'John',
          description: 'User first name',
        },
        lastName: {
          type: 'string',
          example: 'Doe',
          description: 'User last name',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'john.doe@example.com',
          description: 'User email address (must be unique)',
        },
        username: {
          type: 'string',
          example: 'johndoe',
          description: 'Username (must be unique)',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'SecurePass123!',
          description: 'User password (min 8 characters)',
        },
        phone: {
          type: 'string',
          example: '0123456789',
          description: 'Phone number (optional)',
        },
        gender: {
          type: 'string',
          enum: ['MALE', 'FEMALE', 'OTHER'],
          example: 'MALE',
          description: 'User gender',
        },
        role: {
          type: 'string',
          enum: ['USER', 'ADMIN', 'OPERATOR'],
          example: 'USER',
          description: 'User role',
        },
      },
      required: ['email', 'username', 'password'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async createAnUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    return await this.userService.createAnUser(file, createUserDto);
  }

  @ApiOperation({ summary: 'Add a new user by Google account' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully from Google account',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'user@gmail.com' },
        googleId: { type: 'string', example: 'google-oauth-id-123' },
        firstName: { type: 'string', nullable: true },
        lastName: { type: 'string', nullable: true },
        isActive: { type: 'boolean', example: false },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
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
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'john.doe@example.com' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        phone: { type: 'string', example: '0123456789' },
        updatedAt: { type: 'string', format: 'date-time' },
        userMedia: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              mediaPath: { type: 'string' },
            },
          },
        },
      },
    },
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
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'User avatar image file (optional)',
        },
        firstName: {
          type: 'string',
          example: 'John',
          description: 'User first name (optional)',
        },
        lastName: {
          type: 'string',
          example: 'Doe',
          description: 'User last name (optional)',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'john.doe@example.com',
          description: 'User email address (optional)',
        },
        username: {
          type: 'string',
          example: 'johndoe',
          description: 'Username (optional)',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'NewSecurePass123!',
          description: 'New password (optional, min 8 characters)',
        },
        phone: {
          type: 'string',
          example: '0123456789',
          description: 'Phone number (optional)',
        },
        gender: {
          type: 'string',
          enum: ['MALE', 'FEMALE', 'OTHER'],
          example: 'MALE',
          description: 'User gender (optional)',
        },
        role: {
          type: 'string',
          enum: ['USER', 'ADMIN', 'OPERATOR'],
          example: 'USER',
          description: 'User role (optional, ADMIN only)',
        },
        isActive: {
          type: 'boolean',
          example: true,
          description: 'Account active status (optional, ADMIN only)',
        },
        points: {
          type: 'number',
          example: 150,
          description: 'User loyalty points (optional, ADMIN only)',
        },
        staffCode: {
          type: 'string',
          example: 'STAFF001',
          description: 'Staff code for OPERATOR/ADMIN (optional)',
        },
        shopOfficeId: {
          type: 'number',
          example: 1,
          description: 'Shop office ID for staff assignment (optional)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Patch('/:id')
  async updateAnUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.userService.updateAnUser(id, updateUserDto, file);
  }

  @ApiOperation({ summary: 'Get address list of a user' })
  @ApiResponse({
    status: 200,
    description: 'User address list retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          street: { type: 'string' },
          ward: { type: 'string' },
          district: { type: 'string' },
          province: { type: 'string' },
          zipCode: { type: 'string' },
        },
      },
    },
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
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        address: { type: 'string' },
        phone: { type: 'string' },
        staffs: { type: 'array', items: { type: 'object' } },
      },
    },
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
      type: 'object',
      properties: {
        id: { type: 'number' },
        mediaPath: { type: 'string' },
        mediaType: { type: 'string', enum: ['IMAGE', 'VIDEO', 'DOCUMENT'] },
        isAvatarFile: { type: 'boolean' },
      },
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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          code: { type: 'string' },
          discount: { type: 'number' },
          discountType: { type: 'string', enum: ['PERCENTAGE', 'FIXED'] },
          maxUsage: { type: 'number' },
          expiryDate: { type: 'string', format: 'date-time' },
          isActive: { type: 'boolean' },
        },
      },
    },
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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number', format: 'decimal' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          sku: { type: 'string' },
          price: { type: 'number', format: 'decimal' },
          stock: { type: 'number' },
          isActive: { type: 'boolean' },
        },
      },
    },
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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          description: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          orderCode: { type: 'string' },
          totalAmount: { type: 'number', format: 'decimal' },
          status: {
            type: 'string',
            enum: [
              'PENDING',
              'PROCESSING',
              'SHIPPED',
              'DELIVERED',
              'CANCELLED',
            ],
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          orderCode: { type: 'string' },
          totalAmount: { type: 'number', format: 'decimal' },
          status: {
            type: 'string',
            enum: [
              'PENDING',
              'PROCESSING',
              'SHIPPED',
              'DELIVERED',
              'CANCELLED',
            ],
          },
          processedBy: { type: 'string' },
          processedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          trackingNumber: { type: 'string' },
          status: {
            type: 'string',
            enum: ['PENDING', 'IN_TRANSIT', 'DELIVERED'],
          },
          carrier: { type: 'string' },
          processedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          type: { type: 'string', enum: ['RETURN', 'REFUND', 'COMPLAINT'] },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          type: { type: 'string', enum: ['RETURN', 'REFUND', 'COMPLAINT'] },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
          description: { type: 'string' },
          processedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          chest: { type: 'number' },
          waist: { type: 'number' },
          height: { type: 'number' },
          isDefault: { type: 'boolean' },
        },
      },
    },
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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          rating: { type: 'number', minimum: 1, maximum: 5 },
          comment: { type: 'string' },
          productId: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
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
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
        totalPrice: { type: 'number', format: 'decimal' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
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
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        cartId: { type: 'number' },
        productVariantId: { type: 'number' },
        quantity: { type: 'number' },
        price: { type: 'number', format: 'decimal' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
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
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
        totalPrice: { type: 'number', format: 'decimal' },
        itemCount: { type: 'number' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
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
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
        totalPrice: { type: 'number', format: 'decimal' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
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
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
        totalPrice: { type: 'number', format: 'decimal' },
        cartItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              productVariantId: { type: 'number' },
              quantity: { type: 'number' },
              price: { type: 'number', format: 'decimal' },
            },
          },
        },
      },
    },
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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          code: { type: 'string' },
          discount: { type: 'number' },
          discountType: { type: 'string', enum: ['PERCENTAGE', 'FIXED'] },
          expiryDate: { type: 'string', format: 'date-time' },
          isUsed: { type: 'boolean' },
        },
      },
    },
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
