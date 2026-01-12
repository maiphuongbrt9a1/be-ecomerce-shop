import { ApiProperty } from '@nestjs/swagger';
import { Gender, Role } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
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

  @ApiProperty({ example: 'MALE | FEMALE | OTHER' })
  @IsOptional()
  @IsEnum(Gender)
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

  @ApiProperty({ example: 'USER | ADMIN | OPERATOR' })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: new Date() })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ example: 'false' })
  @IsBoolean()
  @Type(() => Boolean)
  isActive: boolean;

  @ApiProperty({ example: false })
  @IsString()
  codeActive: string;

  @ApiProperty({ example: new Date() })
  @IsDate()
  @Type(() => Date)
  codeActiveExpire: Date;

  @ApiProperty({ example: 'ADFASFD-4654231-DAFDS' })
  @IsOptional()
  @IsString()
  staffCode: string;

  @ApiProperty({ example: '0987985465231' })
  @IsOptional()
  @IsString()
  loyaltyCard: string;
}

export class CreateUserByGoogleAccountDto {
  @ApiProperty({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'MALE | FEMALE | OTHER' })
  @IsOptional()
  @IsEnum(Gender)
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

  @ApiProperty({ example: '1234567 | uuid' })
  @IsNotEmpty()
  @IsString()
  googleId: string;

  @ApiProperty({ example: 'johndoe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'USER | ADMIN | OPERATOR' })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: new Date() })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ example: 'false' })
  @IsBoolean()
  @Type(() => Boolean)
  isActive: boolean;

  @ApiProperty({ example: false })
  @IsString()
  codeActive: string;

  @ApiProperty({ example: new Date() })
  @IsDate()
  @Type(() => Date)
  codeActiveExpire: Date;

  @ApiProperty({ example: 'ADFASFD-4654231-DAFDS' })
  @IsOptional()
  @IsString()
  staffCode: string;

  @ApiProperty({ example: '0987985465231' })
  @IsOptional()
  @IsString()
  loyaltyCard: string;
}
