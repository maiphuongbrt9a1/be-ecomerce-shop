import { PartialType } from '@nestjs/swagger';
import { CreateSizeProfileDto } from './create-size-profile.dto';

export class UpdateSizeProfileDto extends PartialType(CreateSizeProfileDto) {}
