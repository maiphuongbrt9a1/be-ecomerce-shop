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
import { CreateUserByGoogleAccountDto } from '@/user/dtos/create.user.dto';
import { Gender, Role, User } from '@prisma/client';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

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

    if (!user.password) {
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
      isActive: user.isActive,
    };

    return processedUser;
  }

  login(user: UserInRequestWithUser) {
    const payload = {
      sub: user.id,
      username: user.email,
      role: user.role,
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
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async handleRegister(registerDto: CreateAuthDto) {
    return await this.userService.handleRegister(registerDto);
  }

  async googleLogin(req: any) {
    if (!req.user) {
      throw new UnauthorizedException('No user from google!');
    }

    const existUser: User | null = await this.userService.getUserByEmail(
      req.user.email,
    );
    if (!existUser) {
      const createUserByGoogleAccountDto: CreateUserByGoogleAccountDto = {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: '',
        googleId: req.user.id,
        username:
          req.user.email.split('@')[0] +
          Math.floor(Math.random() * 100000).toString(),
        role: Role.USER,
        createdAt: new Date(),
        isActive: true,
        gender: Gender.OTHER,
        codeActive: uuidv4().toString(),
        codeActiveExpire: dayjs().add(5, 'minutes').toDate(),
        staffCode: '',
        loyaltyCard: '',
      };

      const newUser: User = await this.userService.createAnUserByGoogleAccount(
        createUserByGoogleAccountDto,
      );

      if (!newUser) {
        throw new UnauthorizedException('Cannot create user from google!');
      }

      return this.login({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        name: newUser.firstName + ' ' + newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
      });
    }

    return this.login({
      id: existUser.id,
      firstName: existUser.firstName,
      lastName: existUser.lastName,
      name: existUser.firstName + ' ' + existUser.lastName,
      email: existUser.email,
      role: existUser.role,
      isActive: existUser.isActive,
    });
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
