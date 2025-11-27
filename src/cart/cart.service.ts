import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Cart } from '@prisma/client';
import { UserCartDetailInformation } from '@/helpers/types/types';

@Injectable()
export class CartService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCartDto: CreateCartDto): Promise<Cart> {
    const result = await this.prismaService.cart.create({
      data: { ...createCartDto },
    });

    return result;
  }

  async findOne(id: number): Promise<Cart | null> {
    const result = await this.prismaService.cart.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new NotFoundException('Cart not found!');
    }

    return result;
  }

  async update(id: number, updateCartDto: UpdateCartDto): Promise<Cart> {
    const result = await this.prismaService.cart.update({
      where: { id: id },
      data: { ...updateCartDto },
    });
    return result;
  }

  async getCartDetails(id: number): Promise<UserCartDetailInformation | null> {
    const result = await this.prismaService.cart.findFirst({
      where: { id: id },
      include: {
        cartItems: {
          include: {
            productVariant: {
              include: {
                media: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException('Cart detail not found!');
    }

    return result;
  }
}
