import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({ example: 4741 })
  @IsNotEmpty()
  userId: bigint;
}
