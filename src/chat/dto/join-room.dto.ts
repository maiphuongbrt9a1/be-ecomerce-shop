import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Target room name that the current user wants to join',
    example: 'room-e2e-001',
  })
  name: string;
}
