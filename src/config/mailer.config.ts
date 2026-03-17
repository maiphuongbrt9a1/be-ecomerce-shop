import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const mailerConfig = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    transport: {
      host: configService.get<string>('MAIL_HOST'),
      port: +configService.get<string>('MAIL_PORT')!,
      secure: true,
      pool: true,
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
      dir: process.cwd() + '/src/mail/templates/',
      // or new PugAdapter() or new EjsAdapter()
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  }),
  inject: [ConfigService],
};
