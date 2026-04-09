import { Controller, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';

@Controller('chat')
@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN', 'USER', 'OPERATOR')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
}
