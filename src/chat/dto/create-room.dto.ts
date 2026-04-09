import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'sample name of room chat' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'description for room chat' })
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Indicates whether the room is private or public',
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
