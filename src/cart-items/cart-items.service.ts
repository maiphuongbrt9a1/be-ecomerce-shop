import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { CartItems, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class CartItemsService {
  private readonly logger = new Logger(CartItemsService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCartItemDto: CreateCartItemDto): Promise<CartItems> {
    try {
      const result = await this.prismaService.cartItems.create({
        data: { ...createCartItemDto },
      });

      this.logger.log(`Cart item created with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to create cart item: ', error);
      throw new BadRequestException('Failed to create cart item');
    }
  }

  async findAll(page: number, perPage: number): Promise<CartItems[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<CartItems, Prisma.CartItemsFindManyArgs>(
        this.prismaService.cartItems,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Fetched all cart items - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all cart items: ', error);
      throw new BadRequestException('Failed to fetch all cart items');
    }
  }

  async findOne(id: number): Promise<CartItems | null> {
    try {
      const result = await this.prismaService.cartItems.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Cart item not found!');
      }

      this.logger.log(`Fetched cart item with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch cart item with ID ${id}: `, error);
      throw new BadRequestException('Failed to fetch cart item');
    }
  }

  async update(
    id: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItems> {
    try {
      const result = await this.prismaService.cartItems.update({
        where: { id: id },
        data: { ...updateCartItemDto },
      });

      this.logger.log(`Updated cart item with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update cart item with ID ${id}: `, error);
      throw new BadRequestException('Failed to update cart item');
    }
  }

  async remove(id: number): Promise<CartItems> {
    try {
      this.logger.log(`Removing cart item with ID: ${id}`);
      return await this.prismaService.cartItems.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error(`Failed to remove cart item with ID ${id}: `, error);
      throw new BadRequestException('Failed to remove cart item');
    }
  }
}
