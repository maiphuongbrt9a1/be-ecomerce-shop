import { Controller, Get, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { CreateMailDto } from './dto/create-mail.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('/hello-mail')
  sendHelloMail() {
    return this.mailService.sendHelloMail();
  }

  @Post()
  @ApiBody({ type: CreateMailDto })
  create(@Body() createMailDto: CreateMailDto) {
    return this.mailService.create(createMailDto);
  }
}
