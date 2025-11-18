import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { CartItems, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class CartItemsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCartItemDto: CreateCartItemDto): Promise<CartItems> {
    const result = await this.prismaService.cartItems.create({
      data: { ...createCartItemDto },
    });

    return result;
  }

  async findAll(page: number, perPage: number): Promise<CartItems[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<CartItems, Prisma.CartItemsFindManyArgs>(
      this.prismaService.cartItems,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async findOne(id: number): Promise<CartItems | null> {
    const result = await this.prismaService.cartItems.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new NotFoundException('Cart item not found!');
    }

    return result;
  }

  async update(
    id: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItems> {
    const result = await this.prismaService.cartItems.update({
      where: { id: id },
      data: { ...updateCartItemDto },
    });
    return result;
  }

  async remove(id: number): Promise<CartItems> {
    return await this.prismaService.cartItems.delete({
      where: { id: id },
    });
  }
}
