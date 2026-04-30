import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const mailerConfig = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const mailPort = +configService.get<string>('MAIL_PORT')!;
    return {
    transport: {
      host: configService.get<string>('MAIL_HOST'),
      port: mailPort,
      secure: mailPort === 465,
      requireTLS: mailPort === 587,
      pool: false,
      family: 4,
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 20_000,
      auth: {
        user: configService.get<string>('MAIL_USER'),
        pass: configService.get<string>('MAIL_PASSWORD'),
      },
    },
    defaults: {
      from: configService.get<string>('MAIL_FROM'),
    },
    // preview: true,
    template: {
      dir: join(__dirname, '..', 'mail', 'templates'),
      // or new PugAdapter() or new EjsAdapter()
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
    };
  },
  inject: [ConfigService],
};
