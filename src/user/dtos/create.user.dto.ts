import { ApiProperty } from '@nestjs/swagger';
import { Address, Gender, Role } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  gender: Gender;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234567890' })
  @IsOptional()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'johndoe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'USER' })
  role: Role;

  @ApiProperty({ example: new Date() })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: 'false' })
  @IsBoolean()
  isActive: boolean;

  @IsString()
  codeActive: string;

  @IsDate()
  codeActiveExpire: Date;

  @IsOptional()
  @IsString()
  staffCode: string;

  @IsOptional()
  @IsBoolean()
  isAdmin: boolean;

  @IsOptional()
  @IsString()
  loyaltyCard: string;
}
