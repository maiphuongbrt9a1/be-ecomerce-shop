import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseEntity {
  @ApiProperty({
    example: 'Operation successful',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    example: { id: 1 },
    description: 'Response data',
    required: false,
  })
  data?: any;
}
