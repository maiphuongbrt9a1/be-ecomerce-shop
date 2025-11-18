import { Module } from '@nestjs/common';
import { ReturnRequestsService } from './return-requests.service';
import { ReturnRequestsController } from './return-requests.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [ReturnRequestsController],
  providers: [ReturnRequestsService, PrismaService],
})
export class ReturnRequestsModule {}
