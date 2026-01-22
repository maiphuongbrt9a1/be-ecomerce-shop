import { Prisma, User } from '@prisma/client';

export type Payload = {
  sub: User['id'];
  username: User['email'];
  role: User['role'];
  firstName: User['firstName'] | null;
  lastName: User['lastName'] | null;
  name: string | null;
};

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

export type ProductsWithProductVariantsAndTheirMedia =
  Prisma.ProductsGetPayload<{
    include: {
      productVariants: {
        include: {
          media: true;
        };
      };
    };
  }>;

export type ProductVariantsWithMediaInformation =
  Prisma.ProductVariantsGetPayload<{
    include: {
      media: true;
    };
  }>;

export const OrdersWithFullInformationInclude =
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
        userMedia: true,
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
        userMedia: true,
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
            userMedia: true,
          },
        },
      },
    },
    payment: true,
    requests: {
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
            userMedia: true,
          },
        },
        media: true,
      },
    },
    orderItems: {
      include: {
        productVariant: {
          include: {
            media: true,
          },
        },
      },
    },
  });

// Tạo Type từ validator trên để dùng làm kiểu trả về
export type OrdersWithFullInformation = Prisma.OrdersGetPayload<{
  include: typeof OrdersWithFullInformationInclude;
}>;

export type ShipmentsWithFullInformation = Prisma.ShipmentsGetPayload<{
  include: {
    processByStaff: {
      include: {
        userMedia: true;
      };
    };
    order: {
      include: typeof OrdersWithFullInformationInclude;
    };
  };
}>;

export type OrderItemsWithVariantAndMediaInformation =
  Prisma.OrderItemsGetPayload<{
    include: {
      productVariant: {
        include: {
          media: true;
        };
      };
    };
  }>;

export type UserCartDetailInformation = Prisma.CartGetPayload<{
  include: {
    cartItems: {
      include: {
        productVariant: {
          include: {
            media: true;
          };
        };
      };
    };
  };
}>;

export type UserVoucherDetailInformation = Prisma.UserVouchersGetPayload<{
  include: {
    voucher: true;
  };
}>;

export type VoucherWithAllAppliedCategoriesDetailInformation =
  Prisma.VouchersGetPayload<{
    include: {
      voucherForCategory: true;
    };
  }>;

export type VoucherWithAllAppliedProductsDetailInformation =
  Prisma.VouchersGetPayload<{
    include: {
      voucherForProduct: true;
    };
  }>;

export type VoucherWithAllAppliedProductVariantsDetailInformation =
  Prisma.VouchersGetPayload<{
    include: {
      voucherForSpecialProductVariant: true;
    };
  }>;

export type RequestsWithMedia = Prisma.RequestsGetPayload<{
  include: {
    media: true;
    processByStaff: {
      include: { userMedia: true };
    };
  };
}>;

export type ReviewsWithMedia = Prisma.ReviewsGetPayload<{
  include: {
    media: true;
  };
}>;

export type CartItemsWithProductVariantAndMedia = Prisma.CartItemsGetPayload<{
  include: {
    productVariant: {
      include: {
        media: true;
      };
    };
  };
}>;
