import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
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
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '1234567890' })
  @IsOptional()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'USER' })
  @IsOptional()
  role: Role;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  createdAt: Date;

  @ApiProperty({ example: 'false' })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsString()
  @IsOptional()
  codeActive: string;

  @ApiProperty({ example: new Date() })
  @IsDate()
  @IsOptional()
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
