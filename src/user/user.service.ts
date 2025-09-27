import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dtos/create.user.dto';
import { UpdateUserDto } from './dtos/update.user.dto';

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
        User_id: id,
      },
    });
    if (!User) {
      throw new NotFoundException('User not found!');
    }
    return User;
  }

  // Create an User
  async createAnUser(data: CreateUserDto): Promise<User> {
    const { first_name, last_name, last_update } = data;

    return this.prismaService.user.create({
      data: {
        first_name,
        last_name,
        last_update,
      },
    });
  }

  // Delete an User
  async deleteAnUser(id: number): Promise<User> {
    return this.prismaService.user.delete({ where: { User_id: id } });
  }

  // Update an User
  async updateAnUser(id: number, data: UpdateUserDto): Promise<User> {
    const { first_name, last_name, last_update } = data;
    return this.prismaService.user.update({
      where: { User_id: id },
      data: {
        first_name,
        last_name,
        last_update,
      },
    });
  }
}
