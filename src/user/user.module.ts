import { Module } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { UserController } from '@/user//user.controller';
import { AwsS3Module } from '@/aws-s3/aws-s3.module';

@Module({
  imports: [AwsS3Module],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
