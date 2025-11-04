import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'Username is required!' })
  username: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email is required!' })
  email: string;

  @IsNotEmpty({ message: 'Password is required!' })
  password: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: '1234567890' })
  phone: string;

  @ApiProperty({ example: 'USER' })
  role: Role;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: 'false' })
  isActive: boolean;
  codeActive: string;
  codeActiveExpire: Date;
}

export class CodeAuthDto {
  @IsNotEmpty({ message: 'Id is required!' })
  id: bigint;

  @IsNotEmpty({ message: 'code active is required!' })
  codeActive: string;
}

export class ChangePasswordAuthDto {
  @IsNotEmpty({ message: 'code active is required!' })
  codeActive: string;

  @IsNotEmpty({ message: 'password is required!' })
  password: string;

  @IsNotEmpty({ message: 'confirmPassword is required!' })
  confirmPassword: string;

  @IsNotEmpty({ message: 'email is required!' })
  email: string;
}
