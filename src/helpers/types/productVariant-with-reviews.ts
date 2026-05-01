import { Prisma } from '@prisma/client';

export type ProductVariantWithReviews = Prisma.ProductVariantsGetPayload<{
  include: {
    reviews: true;
  };
}>;
