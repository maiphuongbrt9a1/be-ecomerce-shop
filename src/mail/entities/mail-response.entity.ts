import { ApiProperty } from '@nestjs/swagger';

export class MailResponseEntity {
  @ApiProperty({
    example: 'Send email from ecommerce shop successfully!',
    description: 'Response message',
  })
  message: string;
}
