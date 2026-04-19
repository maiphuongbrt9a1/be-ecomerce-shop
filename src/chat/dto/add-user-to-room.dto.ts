import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class AddUserToRoomDto {
  @ApiProperty({ description: 'Name of the room to add the user to' })
  @IsString()
  roomName: string;

  @ApiProperty({ description: 'ID of the user to add' })
  @IsNumber()
  userId: number;
}
