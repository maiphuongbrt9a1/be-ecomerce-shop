import { comparePasswordHelper } from '@/helpers/utils';
import { UserService } from '@/user/user.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
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
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserInRequestWithUser> {
    try {
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

      this.logger.log(`(validateUser function) User validated: ${user.email}`);
      return processedUser;
    } catch (error) {
      this.logger.error(
        '(validateUser function) User validation failed: ',
        error,
      );
      throw new UnauthorizedException('Invalid Username or Password');
    }
  }

  login(user: UserInRequestWithUser) {
    try {
      const payload = {
        sub: user.id,
        username: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
      };

      this.logger.log(`(login function) User logged in: ${user.email}`);
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
    } catch (error) {
      this.logger.error('(login function) Login failed: ', error);
      throw new UnauthorizedException('Login failed');
    }
  }

  async handleRegister(registerDto: CreateAuthDto) {
    try {
      this.logger.log(
        '(handleRegister function) Registering user: ' + registerDto.email,
      );
      return await this.userService.handleRegister(registerDto);
    } catch (error) {
      this.logger.error(
        '(handleRegister function) Registration failed: ',
        error,
      );
      throw error;
    }
  }

  async googleLogin(req: any) {
    try {
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

        const newUser: User =
          await this.userService.createAnUserByGoogleAccount(
            createUserByGoogleAccountDto,
          );

        if (!newUser) {
          throw new UnauthorizedException('Cannot create user from google!');
        }

        this.logger.log(
          `(googleLogin function) New user created from Google: ${newUser.email}`,
        );
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

      this.logger.log(
        `(googleLogin function) Existing user logged in from Google: ${existUser.email}`,
      );
      return this.login({
        id: existUser.id,
        firstName: existUser.firstName,
        lastName: existUser.lastName,
        name: existUser.firstName + ' ' + existUser.lastName,
        email: existUser.email,
        role: existUser.role,
        isActive: existUser.isActive,
      });
    } catch (error) {
      this.logger.error('(googleLogin function) Google login failed: ', error);
      throw new UnauthorizedException('Google login failed');
    }
  }

  checkCode = async (data: CodeAuthDto) => {
    try {
      this.logger.log(`(checkCode function) Checking code for ID: ${data.id}`);
      return await this.userService.handleActive(data);
    } catch (error) {
      this.logger.error('(checkCode function) Code check failed: ', error);
      throw error;
    }
  };

  retryActive = async (data: string) => {
    try {
      this.logger.log(
        `(retryActive function) Retrying activation for email: ${data}`,
      );
      return await this.userService.retryActive(data);
    } catch (error) {
      this.logger.error(
        '(retryActive function) Retry activation failed: ',
        error,
      );
      throw error;
    }
  };

  retryPassword = async (data: string) => {
    try {
      this.logger.log(
        '(retryPassword function) Retrying password for email: ' + data,
      );
      return await this.userService.retryPassword(data);
    } catch (error) {
      this.logger.error(
        '(retryPassword function) Retry password failed: ',
        error,
      );
      throw error;
    }
  };

  changePassword = async (data: ChangePasswordAuthDto) => {
    try {
      this.logger.log(
        '(changePassword function) Changing password for email: ' + data.email,
      );
      return await this.userService.changePassword(data);
    } catch (error) {
      this.logger.error(
        '(changePassword function) Change password failed: ',
        error,
      );
      throw error;
    }
  };
}
