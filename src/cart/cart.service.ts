import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  constructor(private readonly prismaService: PrismaService) {}
}
