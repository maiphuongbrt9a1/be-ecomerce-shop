import { PartialType } from '@nestjs/swagger';
import { SecondCreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(SecondCreateOrderDto) {}
