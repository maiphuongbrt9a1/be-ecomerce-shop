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
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import type {
  RequestWithUser,
  RequestWithUserInJWTStrategy,
} from '@/helpers/auth/interfaces/RequestWithUser.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Fetch login')
  @ApiOperation({ summary: 'Login account' })
  handleLogin(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ResponseMessage('Fetch user profile')
  @ApiOperation({ summary: 'Get profile of account' })
  getProfile(@Request() req: RequestWithUserInJWTStrategy) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('signup')
  @Public()
  @ResponseMessage('User register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateAuthDto })
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }

  @Post('check-code')
  @Public()
  @ResponseMessage('Check code active account')
  @ApiOperation({ summary: 'Check code active account' })
  @ApiBody({ type: CodeAuthDto })
  checkCode(@Body() registerDto: CodeAuthDto) {
    return this.authService.checkCode(registerDto);
  }

  @Post('retry-active')
  @Public()
  @ResponseMessage('Retry active account')
  @ApiOperation({ summary: 'Retry active account' })
  retryActive(@Body('email') email: string) {
    return this.authService.retryActive(email);
  }

  @Post('retry-password')
  @Public()
  @ResponseMessage('User retry password')
  @ApiOperation({ summary: 'User retry password' })
  retryPassword(@Body('email') email: string) {
    return this.authService.retryPassword(email);
  }

  @Post('change-password')
  @Public()
  @ResponseMessage('User change password')
  @ApiOperation({ summary: 'User change password' })
  @ApiBody({ type: ChangePasswordAuthDto })
  changePassword(@Body() data: ChangePasswordAuthDto) {
    return this.authService.changePassword(data);
  }
}
