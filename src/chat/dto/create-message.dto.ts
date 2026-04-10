import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Message content to send to a public room',
    example: 'Hello everyone, this is a public message',
  })
  text: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Target public room name where the message will be broadcast',
    example: 'room-e2e-001',
  })
  room_name: string;
}

export class CreatePrivateMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Private message content sent to a single receiver',
    example: 'Hi, can we discuss the order details?',
  })
  text: string;

  @ApiProperty({
    description: 'Receiver user ID (as string) for private message delivery',
    example: '1034',
  })
  @IsString()
  @IsNotEmpty()
  receiver: string;
}
