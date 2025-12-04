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
import { LoginDto } from './dto/login.dto';
import { LoginResponseEntity } from './entities/login-response.entity';
import { AuthResponseEntity } from './entities/auth-response.entity';
import { UserEntity } from '@/user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Fetch login')
  @ApiOperation({ summary: 'Login account' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Login successful', type: LoginResponseEntity })
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ResponseMessage('Fetch user profile')
  @ApiOperation({ summary: 'Get profile of account' })
  @ApiResponse({ status: 200, description: 'User profile fetched', type: UserEntity })
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('signup')
  @Public()
  @ResponseMessage('User register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateAuthDto })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseEntity })
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }

  @Post('check-code')
  @Public()
  @ResponseMessage('Check code active account')
  @ApiOperation({ summary: 'Check code active account' })
  @ApiBody({ type: CodeAuthDto })
  @ApiResponse({ status: 201, description: 'Code verified successfully', type: AuthResponseEntity })
  checkCode(@Body() registerDto: CodeAuthDto) {
    return this.authService.checkCode(registerDto);
  }

  @Post('retry-active')
  @Public()
  @ResponseMessage('Retry active account')
  @ApiOperation({ summary: 'Retry active account' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', example: 'user@example.com' } } } })
  @ApiResponse({ status: 201, description: 'Activation code resent', type: AuthResponseEntity })
  retryActive(@Body('email') email: string) {
    return this.authService.retryActive(email);
  }

  @Post('retry-password')
  @Public()
  @ResponseMessage('User retry password')
  @ApiOperation({ summary: 'User retry password' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', example: 'user@example.com' } } } })
  @ApiResponse({ status: 201, description: 'Password reset code sent', type: AuthResponseEntity })
  retryPassword(@Body('email') email: string) {
    return this.authService.retryPassword(email);
  }

  @Post('change-password')
  @Public()
  @ResponseMessage('User change password')
  @ApiOperation({ summary: 'User change password' })
  @ApiBody({ type: ChangePasswordAuthDto })
  @ApiResponse({ status: 201, description: 'Password changed successfully', type: AuthResponseEntity })
  changePassword(@Body() data: ChangePasswordAuthDto) {
    return this.authService.changePassword(data);
  }
}
