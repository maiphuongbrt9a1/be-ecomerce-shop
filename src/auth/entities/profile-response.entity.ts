import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class ProfileResponseEntity {
  @ApiProperty({ example: 1, description: 'User ID' })
  userId: bigint;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  username: string;

  @ApiProperty({ enum: Role, description: 'User role' })
  role: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    nullable: true,
  })
  firstName: string | null;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    nullable: true,
  })
  name: string | null;
}
