import { ApiProperty } from '@nestjs/swagger';
import { Role, Gender } from '@prisma/client';
import { UserMediaEntity } from './user-media.entity';

export class UserWithMediaEntity {
  @ApiProperty({
    description: 'The unique identifier for the user',
    example: 1,
  })
  id: bigint;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    nullable: true,
  })
  firstName?: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    nullable: true,
  })
  lastName?: string;

  @ApiProperty({
    description: 'The gender of the user',
    enum: ['MALE', 'FEMALE', 'OTHER'],
    example: 'MALE',
    nullable: true,
  })
  gender?: Gender;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '0123456789',
    nullable: true,
  })
  phone?: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe',
  })
  username: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: ['USER', 'ADMIN', 'OPERATOR'],
    example: 'USER',
  })
  role: Role;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'The loyalty card number (for customers)',
    example: 'LC123456',
    nullable: true,
  })
  loyaltyCard?: string;

  @ApiProperty({
    description: 'The staff code (for staff members)',
    example: 'STAFF001',
    nullable: true,
  })
  staffCode?: string;

  @ApiProperty({
    description: 'User loyalty points',
    example: 100,
  })
  points: number;

  @ApiProperty({
    description: 'Array of media files associated with the user (avatar, etc.)',
    type: [UserMediaEntity],
  })
  userMedia: UserMediaEntity[];

  @ApiProperty({
    description: 'The timestamp when the user account was created',
    example: '2025-01-20T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The timestamp when the user account was last updated',
    example: '2025-01-20T10:00:00Z',
  })
  updatedAt: Date;
}
