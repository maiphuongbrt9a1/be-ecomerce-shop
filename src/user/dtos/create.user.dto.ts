import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Gender, Role } from '@prisma/client';
import { Type } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({
    enum: Gender,
    enumName: 'Gender',
    examples: ['MALE', 'FEMALE', 'OTHER'],
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234567890', required: false })
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

  @ApiProperty({
    enum: Role,
    enumName: 'Role',
    examples: ['USER', 'ADMIN', 'OPERATOR'],
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsNotEmpty()
  @Type(() => Boolean)
  isActive: boolean;

  @ApiProperty({ example: uuidv4() })
  @IsString()
  @IsNotEmpty()
  codeActive: string;

  @ApiProperty({ example: new Date() })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  codeActiveExpire: Date;

  @ApiProperty({ example: uuidv4(), required: false })
  @IsOptional()
  @IsString()
  staffCode: string;

  @ApiProperty({ example: '0987985465231', required: false })
  @IsOptional()
  @IsString()
  loyaltyCard: string;

  @ApiProperty({ example: 1, description: 'Shop office ID', required: false })
  @IsOptional()
  shopOfficeId?: bigint;

  @ApiProperty({ example: 0, description: 'point of user', required: false })
  @IsOptional()
  @IsNumber()
  point?: number;
}

export class CreateUserWithFileDto extends CreateUserDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Single file to upload',
  })
  @IsNotEmpty()
  file: Express.Multer.File;
}
export class CreateUserByGoogleAccountDto extends OmitType(CreateUserDto, [
  'password',
] as const) {
  @ApiProperty({ example: 'press google id from front end' })
  @IsNotEmpty()
  @IsString()
  googleId: string;
}
