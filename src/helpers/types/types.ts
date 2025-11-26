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

export const OrderWithFullInformationInclude =
  Prisma.validator<Prisma.OrdersInclude>()({
    user: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        points: true,
        gender: true,
      },
    },
    processByStaff: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        points: true,
        gender: true,
      },
    },
    shippingAddress: true,
    shipments: {
      include: {
        processByStaff: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            points: true,
            gender: true,
          },
        },
      },
    },
    payment: true,
    requests: true,
    orderItems: {
      include: {
        productVariant: {
          include: {
            product: true,
          },
        },
      },
    },
  });

// Tạo Type từ validator trên để dùng làm kiểu trả về
export type OrderWithFullInformation = Prisma.OrdersGetPayload<{
  include: typeof OrderWithFullInformationInclude;
}>;
