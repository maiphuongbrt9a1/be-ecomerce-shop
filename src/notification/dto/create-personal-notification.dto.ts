import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePersonalNotificationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Notification title shown to users',
    example: 'Order Update: Your order #1234 has been shipped!',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Detailed notification message content',
    example:
      'Dear customer, your order #1234 has been shipped and is expected to arrive within 3-5 business days. Thank you for shopping with us!',
  })
  content: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the user who will receive this personal notification',
    example: 1034,
  })
  recipientId: number;
}
