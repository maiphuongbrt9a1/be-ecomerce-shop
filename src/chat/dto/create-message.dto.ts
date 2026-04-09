import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  text: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  room_name: string;
}

export class CreatePrivateMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  text: string;

  @ApiProperty()
  receiver: string;

  @ApiProperty()
  room: string;
}
