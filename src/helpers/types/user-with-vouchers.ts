import { Prisma } from '@prisma/client';

export type UserWithVouchers = Prisma.UserGetPayload<{
  include: {
    userVouchers: {
      include: {
        voucher: true;
      };
    };
  };
}>;
