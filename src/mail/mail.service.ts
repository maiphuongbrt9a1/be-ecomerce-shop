import { Injectable } from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  sendHelloMail() {
    this.mailerService
      .sendMail({
        to: 'maiphuongbrt9a1@gmail.com', // list of receivers
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        template: 'register',
        context: {
          name: 'Mai Phuong - Hardcode name to test',
          activationCode: 123456789,
        },
      })
      .then(() => {})
      .catch(() => {});
    return 'Hello world. This is hello email from ecommerce shop!';
  }

  create(createMailDto: CreateMailDto) {
    this.mailerService
      .sendMail({
        to: createMailDto.to_email, // list of receivers
        from:
          createMailDto.from_email ??
          this.configService.get<string>('MAIL_FROM'),
        subject: createMailDto.subject, // Subject line
        text: createMailDto.text, // plaintext body
        template: 'register',
        context: {
          name: createMailDto.name,
          activationCode: createMailDto.activationCode,
        },
      })
      .then(() => {
        return 'Send email from ecommerce shop successfully!';
      })
      .catch(() => {
        throw new Error('Send email failed!');
      });
  }
}
