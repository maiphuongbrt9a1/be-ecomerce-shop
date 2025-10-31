import { comparePasswordHelper } from '@/helpers/utils';
import { UserService } from '@/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.getUserByEmail(username);
    if (!user) {
      throw new UnauthorizedException('Invalid Username or Password');
    }

    const isValidPassword = await comparePasswordHelper(pass, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid Username or Password');
    }

    return user;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id };
    return {
      user: {
        email: user.email,
        _id: user._id,
        name: user.name,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async handleRegister(registerDto: CreateAuthDto) {
    return this.userService.handleRegister(registerDto);
  }
}
