import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateColorDto {
  @ApiProperty({ example: 'Red' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '#FF0000' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'hexCode must be a valid hex color code (e.g., #FF0000)',
  })
  hexCode: string;
}
