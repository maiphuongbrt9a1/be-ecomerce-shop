import { Prisma } from '@prisma/client';

export type ProductVariantWithAllRelatedVouchers =
  Prisma.ProductVariantsGetPayload<{
    include: {
      voucher: true;
      product: {
        include: {
          voucher: true;
          category: {
            include: {
              voucher: true;
            };
          };
        };
      };
    };
  }>;
