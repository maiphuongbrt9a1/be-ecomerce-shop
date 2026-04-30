import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

type AddressLike = string | { address: string; name?: string };

const toAddressArray = (input: AddressLike | AddressLike[] | undefined): string[] => {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : [input];
  return arr.map((a) => (typeof a === 'string' ? a : a.address));
};

const toSingleAddress = (input: AddressLike | undefined): string | undefined => {
  if (!input) return undefined;
  return typeof input === 'string' ? input : input.address;
};

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

const toBrevoRecipient = (input: AddressLike | AddressLike[] | undefined) => {
  if (!input) return undefined;
  const arr = Array.isArray(input) ? input : [input];
  return arr.map((a) =>
    typeof a === 'string' ? { email: a } : { email: a.address, name: a.name },
  );
};

const brevoHttpTransport = (apiKey: string) => ({
  name: 'brevo-http',
  version: '1.0.0',
  send(
    mail: { data: Record<string, unknown> },
    callback: (err: Error | null, info?: { messageId?: string; response: string }) => void,
  ) {
    const data = mail.data as MailData;

    const fromAddr = toSingleAddress(data.from);
    const sender =
      typeof data.from === 'object' && data.from
        ? { email: (data.from as { address: string }).address, name: (data.from as { name?: string }).name }
        : { email: fromAddr! };

    const payload: Record<string, unknown> = {
      sender,
      to: toBrevoRecipient(data.to),
      subject: data.subject,
    };
    const cc = toBrevoRecipient(data.cc);
    const bcc = toBrevoRecipient(data.bcc);
    if (cc) payload.cc = cc;
    if (bcc) payload.bcc = bcc;
    if (data.replyTo) {
      const r = toSingleAddress(data.replyTo);
      payload.replyTo = { email: r };
    }
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

const resendHttpTransport = (apiKey: string) => ({
  name: 'resend-http',
  version: '1.0.0',
  send(
    mail: { data: Record<string, unknown> },
    callback: (err: Error | null, info?: { messageId?: string; response: string }) => void,
  ) {
    const data = mail.data as {
      from?: AddressLike;
      to?: AddressLike | AddressLike[];
      cc?: AddressLike | AddressLike[];
      bcc?: AddressLike | AddressLike[];
      replyTo?: AddressLike;
      subject?: string;
      html?: string;
      text?: string;
    };

    const payload: Record<string, unknown> = {
      from: toSingleAddress(data.from),
      to: toAddressArray(data.to),
      subject: data.subject,
    };
    if (data.cc) payload.cc = toAddressArray(data.cc);
    if (data.bcc) payload.bcc = toAddressArray(data.bcc);
    if (data.replyTo) payload.reply_to = toSingleAddress(data.replyTo);
    if (data.html) payload.html = data.html;
    if (data.text) payload.text = data.text;

    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const body: { id?: string; message?: string; name?: string } = await res
          .json()
          .catch(() => ({}));
        if (!res.ok) {
          callback(
            new Error(
              `Resend API ${res.status} ${res.statusText}: ${body.name ?? ''} ${body.message ?? JSON.stringify(body)}`,
            ),
          );
          return;
        }
        callback(null, { messageId: body.id, response: 'ok' });
      })
      .catch((err: Error) => callback(err));
  },
});

export const mailerConfig = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const resendKey = configService.get<string>('RESEND_API_KEY');
    const brevoKey = configService.get<string>('BREVO_API_KEY');
    const mailPort = +configService.get<string>('MAIL_PORT')!;

    const transport = brevoKey
      ? brevoHttpTransport(brevoKey)
      : resendKey
      ? resendHttpTransport(resendKey)
      : {
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
