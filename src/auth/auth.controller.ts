import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signIn(
      createAuthDto.username,
      createAuthDto.password,
    );
  }
}
