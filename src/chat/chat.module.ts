import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { MessageService } from './message.service';
import { RoomService } from './room.service';
import { ChatGateway } from './chat.gateway';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';
import { RedisService } from '@/helpers/redis.service';

@Module({
  imports: [PrismaModule, UserModule, AuthModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    MessageService,
    RoomService,
    ChatGateway,
    RedisService,
  ],
  exports: [ChatService, MessageService, RoomService, ChatGateway],
})
export class ChatModule {}
