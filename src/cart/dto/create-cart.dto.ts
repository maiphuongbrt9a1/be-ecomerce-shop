import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCartDto {
  @IsNotEmpty()
  userId: bigint;

  @IsOptional()
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
