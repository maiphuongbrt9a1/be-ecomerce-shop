import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePersonalNotificationDto } from './create-personal-notification.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePersonalNotificationDto extends PartialType(
  CreatePersonalNotificationDto,
) {
  @ApiProperty({
    description: 'Indicates if the notification is read',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
