import { ApiProperty } from '@nestjs/swagger';

export class MailResponseEntity {
  @ApiProperty({
    example: 'Đã gửi email từ Paple',
    description: 'Response message',
  })
  message: string;
}
