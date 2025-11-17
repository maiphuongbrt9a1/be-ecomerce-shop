import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'Username is required!' })
  @IsString()
  username: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required!' })
  email: string;

  @IsNotEmpty({ message: 'Password is required!' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'USER' })
  role: Role;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: 'false' })
  @IsBoolean()
  isActive: boolean;

  @IsString()
  codeActive: string;

  @ApiProperty({ example: new Date() })
  @IsDate()
  codeActiveExpire: Date;
}

export class CodeAuthDto {
  @IsNotEmpty({ message: 'Id is required!' })
  id: bigint;

  @IsNotEmpty({ message: 'code active is required!' })
  @IsString()
  codeActive: string;
}

export class ChangePasswordAuthDto {
  @IsNotEmpty({ message: 'code active is required!' })
  @IsString()
  codeActive: string;

  @IsNotEmpty({ message: 'password is required!' })
  @IsString()
  password: string;

  @IsNotEmpty({ message: 'confirmPassword is required!' })
  @IsString()
  confirmPassword: string;

  @IsNotEmpty({ message: 'email is required!' })
  @IsString()
  @IsEmail()
  email: string;
}
