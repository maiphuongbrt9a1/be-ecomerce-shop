import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dtos/create.user.dto';
import { UpdateUserDto } from './dtos/update.user.dto';
import { v4 as uuidv4 } from 'uuid';
import { hashPasswordHelper } from 'src/helpers/utils';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  // Get the list of all User
  async getAllUser(): Promise<User[] | []> {
    return this.prismaService.user.findMany();
  }

  // Get an User detail
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
        role,
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
}
