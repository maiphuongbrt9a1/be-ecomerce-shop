import { Module } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { UserController } from '@/user//user.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Module({
  imports: [],
  providers: [UserService, PrismaService, AwsS3Service],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
