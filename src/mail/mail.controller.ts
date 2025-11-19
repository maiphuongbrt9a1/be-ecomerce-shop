import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { CreateMailDto } from './dto/create-mail.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('/hello-mail')
  @ApiOperation({ summary: 'Send hello mail from shop' })
  sendHelloMail() {
    return this.mailService.sendHelloMail();
  }

  @Post()
  @ApiOperation({ summary: 'Send custom mail' })
  @ApiBody({ type: CreateMailDto })
  create(@Body() createMailDto: CreateMailDto) {
    return this.mailService.create(createMailDto);
  }
}
