import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { CreateMailDto } from './dto/create-mail.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { MailResponseEntity } from './entities/mail-response.entity';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('/hello-mail')
  @ApiOperation({ summary: 'Send hello mail from shop' })
  @ApiResponse({
    status: 201,
    description: 'Hello mail sent',
    type: MailResponseEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN') // please check role is in Role enum of prisma schema
  sendHelloMail() {
    return this.mailService.sendHelloMail();
  }

  @Post()
  @ApiOperation({ summary: 'Send custom mail' })
  @ApiBody({ type: CreateMailDto })
  @ApiResponse({
    status: 201,
    description: 'Custom mail sent successfully',
    type: MailResponseEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard) // insert roles guard and check role is admin. If true can access this api
  @Roles('ADMIN', 'USER', 'OPERATOR') // please check role is in Role enum of prisma schema
  create(@Body() createMailDto: CreateMailDto) {
    return this.mailService.create(createMailDto);
  }
}
