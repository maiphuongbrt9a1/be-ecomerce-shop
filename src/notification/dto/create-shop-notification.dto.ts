import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateShopNotificationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Notification title shown to users',
    example: 'New Sale Alert: 20% off on all electronics!',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Detailed notification message content',
    example:
      "You can save 20% on all electronics from Aug 1 to Aug 7. Don't miss out on this limited-time offer!",
  })
  content: string;
}
