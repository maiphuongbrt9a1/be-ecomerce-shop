import { ApiProperty } from '@nestjs/swagger';
import { Role, Gender } from '@prisma/client';

export class UserEntity {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: bigint;

  @ApiProperty({ example: 'John', description: 'First name', required: false })
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', required: false })
  lastName?: string;

  @ApiProperty({ enum: Gender, description: 'Gender', required: false })
  gender?: Gender;

  @ApiProperty({ example: 'user@example.com', description: 'Email address' })
  email: string;

  @ApiProperty({ example: '0123456789', description: 'Phone number', required: false })
  phone?: string;

  @ApiProperty({ example: 'johndoe', description: 'Username' })
  username: string;

  @ApiProperty({ example: 'hashedpassword', description: 'Password hash' })
  password: string;

  @ApiProperty({ enum: Role, description: 'User role' })
  role: Role;

  @ApiProperty({ example: true, description: 'Account active status' })
  isActive: boolean;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Activation code' })
  codeActive: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', description: 'Activation code expiry' })
  codeActiveExpire: Date;

  @ApiProperty({ example: 100, description: 'Loyalty points' })
  points: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Updated at' })
  updatedAt: Date;

  @ApiProperty({ example: 'STF001', description: 'Staff code', required: false })
  staffCode?: string;

  @ApiProperty({ example: false, description: 'Is admin' })
  isAdmin: boolean;

  @ApiProperty({ example: 1, description: 'Shop office ID', required: false })
  shopOfficeId?: bigint;

  @ApiProperty({ example: 'LOYAL123', description: 'Loyalty card number', required: false })
  loyaltyCard?: string;
}
