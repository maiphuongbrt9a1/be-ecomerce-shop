import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { CreateMailDto } from './dto/create-mail.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MailResponseEntity } from './entities/mail-response.entity';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('/hello-mail')
  @ApiOperation({ summary: 'Send hello mail from shop' })
  @ApiResponse({ status: 201, description: 'Hello mail sent', type: MailResponseEntity })
  sendHelloMail() {
    return this.mailService.sendHelloMail();
  }

  @Post()
  @ApiOperation({ summary: 'Send custom mail' })
  @ApiBody({ type: CreateMailDto })
  @ApiResponse({ status: 201, description: 'Custom mail sent successfully', type: MailResponseEntity })
  create(@Body() createMailDto: CreateMailDto) {
    return this.mailService.create(createMailDto);
  }
}
