import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Username is required!' })
  username: string;

  @IsNotEmpty({ message: 'Password is required!' })
  password: string;
}
