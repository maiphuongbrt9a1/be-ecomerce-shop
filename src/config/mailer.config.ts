import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

type AddressLike = string | { address: string; name?: string };

type MailData = {
  from?: AddressLike;
  to?: AddressLike | AddressLike[];
  cc?: AddressLike | AddressLike[];
  bcc?: AddressLike | AddressLike[];
  replyTo?: AddressLike;
  subject?: string;
  html?: string;
  text?: string;
};

const toSingleAddress = (input: AddressLike | undefined): string | undefined => {
  if (!input) return undefined;
  return typeof input === 'string' ? input : input.address;
};

const toBrevoRecipient = (input: AddressLike | AddressLike[] | undefined) => {
  if (!input) return undefined;
  const arr = Array.isArray(input) ? input : [input];
  return arr.map((a) =>
    typeof a === 'string' ? { email: a } : { email: a.address, name: a.name },
  );
};

// Custom nodemailer transport that posts to Brevo's HTTP API.
// Needed because Railway (and most PaaS) block outbound SMTP.
const brevoHttpTransport = (apiKey: string) => ({
  name: 'brevo-http',
  version: '1.0.0',
  send(
    mail: { data: Record<string, unknown> },
    callback: (err: Error | null, info?: { messageId?: string; response: string }) => void,
  ) {
    const data = mail.data as MailData;

    const sender =
      typeof data.from === 'object' && data.from
        ? { email: data.from.address, name: data.from.name }
        : { email: toSingleAddress(data.from)! };

    const payload: Record<string, unknown> = {
      sender,
      to: toBrevoRecipient(data.to),
      subject: data.subject,
    };
    const cc = toBrevoRecipient(data.cc);
    const bcc = toBrevoRecipient(data.bcc);
    if (cc) payload.cc = cc;
    if (bcc) payload.bcc = bcc;
    if (data.replyTo) payload.replyTo = { email: toSingleAddress(data.replyTo) };
    if (data.html) payload.htmlContent = data.html;
    if (data.text) payload.textContent = data.text;

    fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const body: { messageId?: string; message?: string; code?: string } = await res
          .json()
          .catch(() => ({}));
        if (!res.ok) {
          callback(
            new Error(
              `Brevo API ${res.status} ${res.statusText}: ${body.code ?? ''} ${body.message ?? JSON.stringify(body)}`,
            ),
          );
          return;
        }
        callback(null, { messageId: body.messageId, response: 'ok' });
      })
      .catch((err: Error) => callback(err));
  },
});

export const mailerConfig = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const brevoKey = configService.get<string>('BREVO_API_KEY');
    const mailPort = +configService.get<string>('MAIL_PORT')!;

    const transport = brevoKey
      ? brevoHttpTransport(brevoKey)
      : {
          host: configService.get<string>('MAIL_HOST'),
          port: mailPort,
          secure: mailPort === 465,
          requireTLS: mailPort === 587,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        };

    return {
      transport,
      defaults: {
        from: configService.get<string>('MAIL_FROM'),
      },
      template: {
        dir: join(__dirname, '..', 'mail', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  },
  inject: [ConfigService],
};
