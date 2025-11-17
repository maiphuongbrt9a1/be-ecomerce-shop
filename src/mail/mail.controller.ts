import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';
import { Public } from '@/decorator/customize';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('/hello-mail')
  sendHelloMail() {
    return this.mailService.sendHelloMail();
  }

  @Post()
  create(@Body() createMailDto: CreateMailDto) {
    return this.mailService.create(createMailDto);
  }
}
