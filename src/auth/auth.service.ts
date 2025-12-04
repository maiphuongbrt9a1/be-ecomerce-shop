import { comparePasswordHelper } from '@/helpers/utils';
import { UserService } from '@/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from './dto/create-auth.dto';
import { UserInRequestWithUser } from '@/helpers/auth/interfaces/RequestWithUser.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserInRequestWithUser> {
    const user = await this.userService.getUserByEmail(username);
    if (!user) {
      throw new UnauthorizedException('Invalid Username or Password');
    }

    const isValidPassword = await comparePasswordHelper(pass, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid Username or Password');
    }

    const processedUser: UserInRequestWithUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.firstName + ' ' + user.lastName,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
    };

    return processedUser;
  }

  login(user: UserInRequestWithUser) {
    const payload = {
      sub: user.id,
      username: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
    };
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async handleRegister(registerDto: CreateAuthDto) {
    return await this.userService.handleRegister(registerDto);
  }

  checkCode = async (data: CodeAuthDto) => {
    return await this.userService.handleActive(data);
  };

  retryActive = async (data: string) => {
    return await this.userService.retryActive(data);
  };

  retryPassword = async (data: string) => {
    return await this.userService.retryPassword(data);
  };

  changePassword = async (data: ChangePasswordAuthDto) => {
    return await this.userService.changePassword(data);
  };
}
