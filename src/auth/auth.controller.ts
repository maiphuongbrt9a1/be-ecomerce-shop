import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from '@/auth/dto/create-auth.dto';
import { Public, ResponseMessage } from '@/decorator/customize';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type {
  RequestWithUser,
  RequestWithUserInJWTStrategy,
} from '@/helpers/auth/interfaces/RequestWithUser.interface';
import { GoogleOAuthGuard } from './passport/google-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login account' })
  @ApiBody({
    description: 'User login credentials',
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'user@example.com',
          description: 'Email or username',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'Password123!',
          description: 'User password',
        },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description: 'JWT access token',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            username: { type: 'string', example: 'john_doe' },
            role: { type: 'string', enum: ['USER', 'ADMIN', 'OPERATOR'] },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User does not exist',
  })
  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Fetch login')
  handleLogin(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Get profile of account' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'user@example.com' },
        username: { type: 'string', example: 'john_doe' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        role: { type: 'string', enum: ['USER', 'ADMIN', 'OPERATOR'] },
        isActive: { type: 'boolean', example: true },
        points: { type: 'number', example: 150 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Token is invalid or expired',
  })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ResponseMessage('Fetch user profile')
  getProfile(@Request() req: RequestWithUserInJWTStrategy) {
    return req.user;
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    type: CreateAuthDto,
    description: 'User registration data',
    examples: {
      example1: {
        value: {
          email: 'newuser@example.com',
          username: 'newuser',
          password: 'SecurePass123!',
          firstName: 'Jane',
          lastName: 'Smith',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. Activation email sent.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'newuser@example.com' },
        username: { type: 'string', example: 'newuser' },
        isActive: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example:
            'Registration successful. Please check your email to activate your account.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid input, email or username already exists',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email or username already registered',
  })
  @UseGuards(JwtAuthGuard)
  @Post('signup')
  @Public()
  @ResponseMessage('User register')
  async register(@Body() registerDto: CreateAuthDto) {
    return await this.authService.handleRegister(registerDto);
  }

  @ApiOperation({ summary: 'User login with Google account' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google OAuth consent screen',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - OAuth configuration issue',
  })
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ResponseMessage('User login with Google account')
  async googleAuth(@Request() req) {}

  @ApiOperation({ summary: 'Redirect when User login with Google account' })
  @ApiResponse({
    status: 200,
    description: 'Google login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'JWT access token' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            googleId: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Google authentication failed',
  })
  @Get('/google/google-redirect')
  @ResponseMessage('Redirect when User login with Google account')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Request() req) {
    return await this.authService.googleLogin(req);
  }

  @ApiOperation({ summary: 'Check code active account' })
  @ApiBody({
    type: CodeAuthDto,
    description: 'Account activation code verification',
    examples: {
      example1: {
        value: {
          email: 'user@example.com',
          code: '123456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Account activated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Account activated successfully',
        },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid or expired code',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found or already activated',
  })
  @Post('check-code')
  @Public()
  @ResponseMessage('Check code active account')
  async checkCode(@Body() registerDto: CodeAuthDto) {
    return await this.authService.checkCode(registerDto);
  }

  @ApiOperation({ summary: 'Retry active account' })
  @ApiBody({
    description: 'Email address to resend activation code',
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
          description: 'Registered email address',
        },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Activation email resent successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Activation code has been resent to your email',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Account already activated',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Email not registered',
  })
  @Post('retry-active')
  @Public()
  @ResponseMessage('Retry active account')
  async retryActive(@Body('email') email: string) {
    return await this.authService.retryActive(email);
  }

  @ApiOperation({ summary: 'User retry password' })
  @ApiBody({
    description: 'Email address for password reset',
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
          description: 'Registered email address',
        },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password reset code has been sent to your email',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Email not registered',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Please wait before requesting again',
  })
  @Post('retry-password')
  @Public()
  @ResponseMessage('User retry password')
  async retryPassword(@Body('email') email: string) {
    return await this.authService.retryPassword(email);
  }

  @ApiOperation({ summary: 'User change password' })
  @ApiBody({
    type: ChangePasswordAuthDto,
    description: 'Password change with verification code',
    examples: {
      example1: {
        value: {
          email: 'user@example.com',
          code: '123456',
          newPassword: 'NewSecurePass123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password has been changed successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid or expired reset code',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  @Post('change-password')
  @Public()
  @ResponseMessage('User change password')
  async changePassword(@Body() data: ChangePasswordAuthDto) {
    return await this.authService.changePassword(data);
  }
}
