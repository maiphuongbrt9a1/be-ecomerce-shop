import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Unique room name used to create or identify the chat room',
    example: 'room-e2e-001',
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description:
      'Optional room description shown to users in room list/details',
    example: 'Public room for discussing order updates',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description:
      'Optional flag to indicate room visibility. True: private room, False: public room',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
