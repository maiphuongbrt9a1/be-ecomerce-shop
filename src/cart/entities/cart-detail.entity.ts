import { ApiProperty } from '@nestjs/swagger';
import { CartEntity } from './cart.entity';
import { CartItemWithVariantEntity } from '@/cart-items/entities/cart-item-with-variant.entity';

export class CartDetailEntity extends CartEntity {
  @ApiProperty({ type: [CartItemWithVariantEntity] })
  cartItems: CartItemWithVariantEntity[];
}
