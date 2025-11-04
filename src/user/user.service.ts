import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, Prisma, Role } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from '@/user/dtos/create.user.dto';
import { UpdateUserDto } from '@/user/dtos/update.user.dto';
import { v4 as uuidv4 } from 'uuid';
import { hashPasswordHelper } from '@/helpers/utils';
import { createPaginator } from 'prisma-pagination';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from '@/auth/dto/create-auth.dto';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  // Get the list of all User
  async getAllUser(page: number, perPage: number): Promise<User[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<User, Prisma.UserFindManyArgs>(
      this.prismaService.user,
      {},
      { page: page },
    );
    return result.data;
  }

  // Get an User by id
  async getUserDetail(id: number): Promise<User | null> {
    const User = await this.prismaService.user.findFirst({
      where: {
        id: id,
      },
    });
    if (!User) {
      throw new NotFoundException('User not found!');
    }
    return User;
  }

  // Get an User by email
  async getUserByEmail(email: string): Promise<User | null> {
    const User = await this.prismaService.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!User) {
      throw new NotFoundException('User not found!');
    }
    return User;
  }

  // Get an User by phone
  async getUserByPhone(phone: string): Promise<User | null> {
    const User = await this.prismaService.user.findFirst({
      where: {
        phone: phone,
      },
    });
    if (!User) {
      throw new NotFoundException('User not found!');
    }
    return User;
  }

  // Get an User by username
  async getUserByUserName(username: string): Promise<User | null> {
    const User = await this.prismaService.user.findFirst({
      where: {
        username: username,
      },
    });
    if (!User) {
      throw new NotFoundException('User not found!');
    }
    return User;
  }

  // Create an User
  async createAnUser(data: CreateUserDto): Promise<User> {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      username,
      role,
      isActive,
    } = data;

    const hashPassword = await hashPasswordHelper(password);
    if (!hashPassword) {
      throw new Error('Hash password for create user failed!');
    }

    return this.prismaService.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashPassword,
        username,
        role: role ?? Role.USER,
        createdAt: new Date(Date.now()),
        isActive,
        codeActive: uuidv4().toString(),
        codeActiveExpire: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
  }

  // Delete an User
  async deleteAnUser(id: number): Promise<User> {
    return this.prismaService.user.delete({ where: { id: id } });
  }

  // Update an User
  async updateAnUser(id: number, data: UpdateUserDto): Promise<User> {
    const { firstName, lastName, email, phone, password, username, updatedAt } =
      data;

    const hashPassword = await hashPasswordHelper(password);
    if (!hashPassword) {
      throw new Error('Hash password for create user failed!');
    }

    return this.prismaService.user.update({
      where: { id: id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashPassword,
        username,
        updatedAt: new Date(Date.now()),
      },
    });
  }

  async handleRegister(registerDto: CreateAuthDto): Promise<User> {
    const { firstName, lastName, email, phone, password, username } =
      registerDto;

    const isExist = await this.prismaService.user.findUnique({
      where: { email: email },
    });
    if (isExist) {
      throw new BadRequestException(
        `Email is existed: ${email}. Please use another email.`,
      );
    }

    const hashPassword = await hashPasswordHelper(password);
    if (!hashPassword) {
      throw new Error('Hash password for create user failed!');
    }

    const user = await this.prismaService.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashPassword,
        username,
        role: Role.USER,
        createdAt: new Date(Date.now()),
        isActive: false,
        codeActive: uuidv4().toString(),
        codeActiveExpire: dayjs().add(5, 'minutes').toDate(),
      },
    });

    let fullname = user.email;
    if (user.firstName && user.lastName) {
      fullname = user.firstName + ' ' + user.lastName;
    }

    this.mailerService
      .sendMail({
        to: user.email,
        from: this.configService.get<string>('MAIL_FROM'),
        subject: 'Activate your account at E-commerce shop',
        text: 'Please use the code to activate your account',
        template: 'register',
        context: {
          name: fullname,
          activationCode: user.codeActive,
        },
      })
      .then(() => {
        return 'Send email from ecommerce shop successfully!';
      })
      .catch(() => {
        throw new Error('Send email failed!');
      });

    return user;
  }

  async handleActive(data: CodeAuthDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: data.id,
        codeActive: data.codeActive,
      },
    });
    if (!user) {
      throw new BadRequestException('Code active is expired or invalid');
    }

    //check expire code
    const isBeforeCheck = dayjs().isBefore(user.codeActiveExpire);

    if (isBeforeCheck) {
      //valid => update user
      const userAfterUpdate = await this.prismaService.user.update({
        where: {
          id: data.id,
          codeActive: data.codeActive,
        },
        data: {
          isActive: true,
        },
      });
      return { userAfterUpdate };
    } else {
      throw new BadRequestException('Code active is expired or invalid');
    }
  }

  async retryActive(email: string) {
    //check email
    const user = await this.prismaService.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new BadRequestException('This account does not exist!');
    }
    if (user.isActive) {
      throw new BadRequestException('This account has been activated!');
    }

    //send Email
    const codeActive = uuidv4().toString();

    //update user
    const userAfterUpdate = await this.prismaService.user.update({
      where: {
        id: user.id,
      },

      data: {
        codeActive: codeActive,
        codeActiveExpire: dayjs().add(5, 'minutes').toDate(),
      },
    });

    //send email
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: 'Activate your account at BK E-commerce shop', // Subject line
      template: 'register',
      context: {
        name: user?.lastName ?? user.email,
        activationCode: codeActive,
      },
    });
    return { id: user.id };
  }

  async retryPassword(email: string) {
    //check email
    const user = await this.prismaService.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new BadRequestException('This account does not exist!');
    }

    //send Email
    const codeActive = uuidv4().toString();

    //update user
    const userAfterUpdate = await this.prismaService.user.update({
      where: {
        id: user.id,
      },

      data: {
        codeActive: codeActive,
        codeActiveExpire: dayjs().add(5, 'minutes').toDate(),
      },
    });

    //send email
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: 'Change your password account at BK E-commerce shop', // Subject line
      template: 'register',
      context: {
        name: user?.lastName ?? user.email,
        activationCode: codeActive,
      },
    });
    return { id: user.id, email: user.email };
  }

  async changePassword(data: ChangePasswordAuthDto) {
    if (data.confirmPassword !== data.password) {
      throw new BadRequestException(
        'Password / Confirm password does not match.',
      );
    }

    //check email
    const user = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new BadRequestException('Account does not exist!');
    }

    //check expire code
    const isBeforeCheck = dayjs().isBefore(user.codeActiveExpire);

    if (isBeforeCheck) {
      //valid => update password
      const newPassword = await hashPasswordHelper(data.password);
      const userAfterUpdate = await this.prismaService.user.update({
        where: {
          email: data.email,
        },
        data: {
          password: newPassword,
        },
      });

      return userAfterUpdate.id;
    } else {
      throw new BadRequestException(
        'Activation code is invalid or has expired',
      );
    }
  }
}
