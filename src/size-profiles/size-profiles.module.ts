import { Module } from '@nestjs/common';
import { SizeProfilesService } from './size-profiles.service';
import { SizeProfilesController } from './size-profiles.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [SizeProfilesController],
  providers: [SizeProfilesService, PrismaService],
})
export class SizeProfilesModule {}
