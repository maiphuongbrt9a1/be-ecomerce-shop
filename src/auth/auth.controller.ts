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

  @ApiResponse({
    status: 200,
    description: 'Login successful, returns access token and user info.',
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Fetch login')
  @ApiOperation({ summary: 'Login account' })
  handleLogin(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @ApiResponse({
    status: 200,
    description: 'Profile fetched successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ResponseMessage('Fetch user profile')
  @ApiOperation({ summary: 'Get profile of account' })
  getProfile(@Request() req: RequestWithUserInJWTStrategy) {
    return req.user;
  }

  @ApiResponse({
    status: 200,
    description: 'User registered successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @UseGuards(JwtAuthGuard)
  @Post('signup')
  @Public()
  @ResponseMessage('User register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateAuthDto })
  async register(@Body() registerDto: CreateAuthDto) {
    return await this.authService.handleRegister(registerDto);
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ResponseMessage('User login with Google account')
  @ApiOperation({ summary: 'User login with Google account' })
  async googleAuth(@Request() req) {}

  @Get('/google/google-redirect')
  @ResponseMessage('Redirect when User login with Google account')
  @ApiOperation({ summary: 'Redirect when User login with Google account' })
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Request() req) {
    return await this.authService.googleLogin(req);
  }

  @Post('check-code')
  @Public()
  @ResponseMessage('Check code active account')
  @ApiOperation({ summary: 'Check code active account' })
  @ApiBody({ type: CodeAuthDto })
  @ApiResponse({
    status: 200,
    description: 'Check code successful.',
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async checkCode(@Body() registerDto: CodeAuthDto) {
    return await this.authService.checkCode(registerDto);
  }

  @Post('retry-active')
  @Public()
  @ResponseMessage('Retry active account')
  @ApiOperation({ summary: 'Retry active account' })
  @ApiResponse({
    status: 200,
    description: 'Retry active account successful.',
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async retryActive(@Body('email') email: string) {
    return await this.authService.retryActive(email);
  }

  @Post('retry-password')
  @Public()
  @ResponseMessage('User retry password')
  @ApiOperation({ summary: 'User retry password' })
  @ApiResponse({
    status: 200,
    description: 'User retry password successful.',
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async retryPassword(@Body('email') email: string) {
    return await this.authService.retryPassword(email);
  }

  @Post('change-password')
  @Public()
  @ResponseMessage('User change password')
  @ApiOperation({ summary: 'User change password' })
  @ApiResponse({
    status: 200,
    description: 'User change password successful.',
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBody({ type: ChangePasswordAuthDto })
  async changePassword(@Body() data: ChangePasswordAuthDto) {
    return await this.authService.changePassword(data);
  }
}
