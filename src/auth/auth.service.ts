import { comparePasswordHelper } from '@/helpers/utils';
import { UserService } from '@/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.getUserByEmail(username);
    if (!user) {
      throw new UnauthorizedException('Invalid Username or Password');
    }

    const isValidPassword = comparePasswordHelper(pass, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid Username or Password');
    }

    const payload = { sub: user.id, username: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
