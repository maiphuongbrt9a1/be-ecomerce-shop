import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234567890' })
  @IsOptional()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'password123' })
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty({ example: 'johndoe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  @IsDate()
  updatedAt: Date;
}
