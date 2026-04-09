import type { User } from '@prisma/client';

declare module 'http' {
  interface IncomingMessage {
    user: User;
    decoded_token?: {
      id?: string | number;
      sub?: string | number;
      iat: number;
      exp: number;
      [key: string]: unknown;
    };
  }
}
