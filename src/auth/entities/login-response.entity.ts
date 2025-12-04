import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

class LoginUserData {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: bigint;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  name: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ enum: Role, description: 'User role' })
  role: Role;

  @ApiProperty({ example: false, description: 'Is admin flag' })
  isAdmin: boolean;
}

export class LoginResponseEntity {
  @ApiProperty({ type: LoginUserData, description: 'User information' })
  user: LoginUserData;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT access token' })
  access_token: string;
}
