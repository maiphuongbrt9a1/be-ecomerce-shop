import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMailDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required!' })
  to_email: string;

  @IsEmail()
  @IsOptional()
  from_email: string;

  @ApiProperty({ example: 'Activation email for your account' })
  subject: string;

  @ApiProperty({ example: 'Hello John Doe' })
  text: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1234567' })
  @IsNotEmpty()
  activationCode: string;
}
