import { Module } from '@nestjs/common';
import { SizeProfilesService } from './size-profiles.service';
import { SizeProfilesController } from './size-profiles.controller';

@Module({
  controllers: [SizeProfilesController],
  providers: [SizeProfilesService],
})
export class SizeProfilesModule {}
