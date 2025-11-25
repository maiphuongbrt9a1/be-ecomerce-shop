import { Prisma } from '@prisma/client';

export type ShopOfficeWithStaffs = Prisma.ShopOfficeGetPayload<{
  include: {
    staffs: true;
  };
}>;

export type UserWithUserMedia = Prisma.UserGetPayload<{
  include: {
    userMedia: true;
  };
}>;

export type ProductsOfCategoryOfShopOffice = Prisma.ShopOfficeGetPayload<{
  select: {
    products: true;
  };
}>;
