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
  @ApiProperty({ example: 'JohnDoe465465' })
  @IsNotEmpty({ message: 'Username is required!' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'xample@gmail.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required!' })
  email: string;

  @ApiProperty({ example: 'JohnDoe465465454' })
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

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @ApiProperty({ example: 'fddsafds4564521dfsaf' })
  @IsString()
  @IsOptional()
  codeActive: string;

  @ApiProperty({ example: new Date() })
  @IsDate()
  @IsOptional()
  codeActiveExpire: Date;
}

export class CodeAuthDto {
  @ApiProperty({ example: 4654 })
  @IsNotEmpty({ message: 'Id is required!' })
  id: bigint;

  @ApiProperty({ example: 'fdsafdiuowuroi465872dsafd' })
  @IsNotEmpty({ message: 'code active is required!' })
  @IsString()
  codeActive: string;
}

export class ChangePasswordAuthDto {
  @ApiProperty({ example: 'safdsafdewr4656121' })
  @IsNotEmpty({ message: 'code active is required!' })
  @IsString()
  codeActive: string;

  @ApiProperty({ example: 'JohnDoe465465' })
  @IsNotEmpty({ message: 'password is required!' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'JohnDoe465465' })
  @IsNotEmpty({ message: 'confirmPassword is required!' })
  @IsString()
  confirmPassword: string;

  @ApiProperty({ example: 'xample@gmail.com' })
  @IsNotEmpty({ message: 'email is required!' })
  @IsString()
  @IsEmail()
  email: string;
}
