import { Prisma, User } from '@prisma/client';

/**
 * JWT token payload structure for authentication.
 *
 * This type represents the data encoded in JWT access tokens.
 * Used by JWT strategy to extract and validate user information from tokens.
 *
 * @typedef {Object} Payload
 * @property {bigint} sub - Subject: User ID (JWT standard 'sub' claim)
 * @property {string} username - User's email address used as unique username
 * @property {string} role - User's role (USER, ADMIN, STAFF)
 * @property {string | null} firstName - User's first name (nullable)
 * @property {string | null} lastName - User's last name (nullable)
 * @property {string | null} name - User's full name concatenated (nullable)
 *
 * @remarks
 * - Generated during login/registration by JwtService.sign()
 * - Decoded by Passport JWT strategy for request.user population
 * - 'sub' is JWT standard for subject (user ID)
 * - username equals email for authentication purposes
 * - Includes name fields for display in responses/logs
 * - Nullable name fields allow flexible user data
 * - Role determines authorization via @Roles() decorator
 */
export type Payload = {
  sub: User['id'];
  username: User['email'];
  role: User['role'];
  firstName: User['firstName'] | null;
  lastName: User['lastName'] | null;
  name: string | null;
};

/**
 * Shop office with complete staff member information.
 *
 * Includes all staff members assigned to the shop office.
 * Used when displaying shop management pages or staffing details.
 *
 * @remarks
 * - Includes: staffs array with all User records assigned to shop
 * - Used in admin shop management interfaces
 * - Loads complete User objects for staff members
 * - Staffs array contains all staff User objects
 * - Used for permission and role validation in shop context
 */
export type ShopOfficeWithStaffs = Prisma.ShopOfficeGetPayload<{
  include: {
    staffs: true;
  };
}>;

/**
 * User with all associated media files (avatars, reviews, etc.).
 *
 * Includes all Media records related to the user (avatars, review uploads, etc.).
 * Used when retrieving complete user profile with all media attachments.
 *
 * @remarks
 * - Includes: userMedia array with all Media records associated with user
 * - userMedia includes avatars, review photos, request attachments
 * - Used in user profile endpoints
 * - Used in admin user management pages
 * - Media URLs need to be converted from S3 keys to full URLs
 * - Used for media management and cleanup operations
 */
export type UserWithUserMedia = Prisma.UserGetPayload<{
  include: {
    userMedia: true;
  };
}>;

/**
 * All products belonging to a shop office's categories.
 *
 * Retrieves only the products array from a shop office.
 * Used for efficient product listing within a shop's scope.
 *
 * @remarks
 * - Selects: only products array from ShopOffice
 * - Used for shop product catalog display
 * - Lighter than loading entire ShopOffice with all relations
 * - Products array contains Product records in shop
 * - Used in shop product filtering and browsing
 * - Optimized for product listing performance
 */
export type ProductsOfCategoryOfShopOffice = Prisma.ShopOfficeGetPayload<{
  select: {
    products: true;
  };
}>;

/**
 * Complete product information including all variants and media.
 *
 * Includes product variants (size/color combinations) and all media files.
 * Used when displaying full product details with all available options.
 *
 * @remarks
 * - Includes: productVariants array with all product variants
 * - Includes: media array for each product variant
 * - Used in product detail pages
 * - Media URLs need conversion from S3 keys to full URLs
 * - Heavy query - loads all variant information
 * - Used for comprehensive product information displays
 * - Each variant includes its own media array
 */
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

/**
 * Product variant (size/color combination) with all associated media.
 *
 * Single product variant including size, color, price and all media files.
 * Used when retrieving details for specific product variant.
 *
 * @remarks
 * - Includes: media array with all images/videos for this variant
 * - Variant includes: size, color, price, stock, SKU
 * - Used in product detail pages
 * - Used in cart and order displays
 * - Media URLs need conversion from S3 keys to full URLs
 * - Used in variant selection interfaces
 * - Media used for product thumbnails and galleries
 */
export type ProductVariantsWithMediaInformation =
  Prisma.ProductVariantsGetPayload<{
    include: {
      media: true;
    };
  }>;

/**
 * Prisma validator defining complete include structure for Order queries.
 *
 * Defines what relations and fields to include when querying orders.
 * Used to ensure consistent order data retrieval across services.
 *
 * @remarks
 * - Validator pattern: Prisma.validator<Prisma.OrdersInclude>()
 * - Includes: user with basic info and media
 * - Includes: processByStaff with their info and media
 * - Includes: shippingAddress full information
 * - Includes: shipments with staff and media
 * - Includes: payment information
 * - Includes: requests with staff and media
 * - Includes: orderItems with product variant and media
 * - Used in OrdersWithFullInformation type
 * - Ensures all order-related data loaded in single query
 * - Optimizes database queries by defining reusable structure
 */
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
/**
 * Complete order information with all related entities and details.
 *
 * Full order retrieval including user, staff, addresses, shipments, payments,
 * service requests, and line items with complete product information.
 * Used in order detail pages and admin order management.
 *
 * @remarks
 * - Includes: user (customer information)
 * - Includes: processByStaff (assigning staff)
 * - Includes: shippingAddress (delivery location)
 * - Includes: shipments (tracking information)
 * - Includes: payment details
 * - Includes: requests (service requests associated with order)
 * - Includes: orderItems (line items with variants and media)
 * - Used in order detail endpoints
 * - Used in admin order pages
 * - Heavy query - loads all order-related data
 * - All media URLs need conversion from S3 keys
 * - Optimized for comprehensive order display
 *
 * @example
 * const order = await prisma.orders.findUnique({
 *   where: { id: orderId },
 *   include: OrdersWithFullInformationInclude
 * });
 */
export type OrdersWithFullInformation = Prisma.OrdersGetPayload<{
  include: typeof OrdersWithFullInformationInclude;
}>;

/**
 * Shipment with complete staff and order information.
 *
 * Includes shipment tracking details, assigned staff member,
 * and complete order information for the shipment.
 * Used in shipment tracking and logistics management.
 *
 * @remarks
 * - Includes: processByStaff (logistics staff handling shipment)
 * - Includes: order (complete order associated with shipment)
 * - Used in shipment tracking pages
 * - Used in admin shipment management
 * - Loads staff with their user media (avatar)
 * - Loads full order with all relations
 * - Media URLs need conversion from S3 keys
 * - Used for shipment status and tracking
 *
 * @example
 * const shipment = await prisma.shipments.findUnique({
 *   where: { id: shipmentId },
 *   include: {
 *     processByStaff: { include: { userMedia: true } },
 *     order: { include: OrdersWithFullInformationInclude }
 *   }
 * });
 */
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

/**
 * Order line item with complete product variant and media information.
 *
 * Single order item including purchased product variant details,
 * media files, and pricing information.
 * Used in order detail displays and shopping cart.
 *
 * @remarks
 * - Includes: productVariants with all variant details
 * - Includes: media for the product variant
 * - Contains: quantity, price, and SKU for order record
 * - Used in order line item displays
 * - Used in shopping cart item display
 * - Media URLs need conversion from S3 keys
 * - Includes size, color, and stock information
 * - Used in return request processing
 *
 * @example
 * const item = await prisma.orderItems.findUnique({
 *   where: { id: itemId },
 *   include: {
 *     productVariants: {
 *       include: { media: true }
 *     }
 *   }
 * });
 */
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

/**
 * User's shopping cart with all item details and product information.
 *
 * Complete cart including all cart items with product variants,
 * media, and pricing. Used in shopping cart display and checkout.
 *
 * @remarks
 * - Includes: cartItems array with all items in cart
 * - Includes: productVariants for each item
 * - Includes: media for each product variant
 * - Used in cart display pages
 * - Used in checkout flow
 * - Each item includes variant details (size, color, price)
 * - Media URLs need conversion from S3 keys
 * - Used for cart total calculations
 * - Used for coupon/voucher application
 *
 * @example
 * const cart = await prisma.user.findUnique({
 *   where: { id: userId },
 *   include: {
 *     cartItems: {
 *       include: {
 *         productVariants: {
 *           include: { media: true }
 *         }
 *       }
 *     }
 *   }
 * });
 */
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

/**
 * User's voucher with complete discount information and validity details.
 *
 * Includes user-specific voucher data with discount type, amount,
 * and validity dates. Used in voucher display and discount application.
 *
 * @remarks
 * - Includes: voucher with all voucher details
 * - Voucher includes: discount type (percentage/fixed amount)
 * - Voucher includes: discount value and validity dates
 * - Voucher includes: maximum uses and current usage count
 * - Used in voucher listing pages
 * - Used in coupon code application
 * - Used in discount calculation
 * - Tracks user's available vouchers
 *
 * @example
 * const userVouchers = await prisma.userVouchers.findUnique({
 *   where: { id: userVoucherId },
 *   include: { voucher: true }
 * });
 */
export type UserVoucherDetailInformation = Prisma.UserVouchersGetPayload<{
  include: {
    voucher: true;
  };
}>;

/**
 * Voucher with all associated product categories it applies to.
 *
 * Includes list of product categories eligible for this voucher discount.
 * Used in voucher detail display and validation.
 *
 * @remarks
 * - Includes: voucherProductCategory array
 * - voucherProductCategory contains category details
 * - Used in voucher management pages
 * - Used in discount validation for products
 * - Determines which product categories qualify for voucher
 * - Empty array means voucher applies to all categories
 * - Used in voucher application logic
 *
 * @example
 * const voucher = await prisma.vouchers.findUnique({
 *   where: { id: voucherId },
 *   include: { voucherProductCategory: true }
 * });
 */
export type VoucherWithAllAppliedCategoriesDetailInformation =
  Prisma.VouchersGetPayload<{
    include: {
      voucherForCategory: true;
    };
  }>;

/**
 * Voucher with all associated products it applies to.
 *
 * Includes list of specific products eligible for this voucher discount.
 * Used in voucher detail display and product-specific discounts.
 *
 * @remarks
 * - Includes: voucherProducts array
 * - voucherProducts contains specific product details
 * - Used in voucher management pages
 * - Used in discount validation for specific products
 * - Determines which products qualify for voucher
 * - Empty array means voucher applies via categories
 * - Used in discount calculation logic
 *
 * @example
 * const voucher = await prisma.vouchers.findUnique({
 *   where: { id: voucherId },
 *   include: { voucherProducts: true }
 * });
 */
export type VoucherWithAllAppliedProductsDetailInformation =
  Prisma.VouchersGetPayload<{
    include: {
      voucherForProduct: true;
    };
  }>;

/**
 * Voucher with all associated product variants it applies to.
 *
 * Includes list of specific product variants (size/color combinations)
 * eligible for this voucher discount. Used in variant-specific discounts.
 *
 * @remarks
 * - Includes: voucherProductVariant array
 * - voucherProductVariant contains variant details
 * - Used in voucher management pages
 * - Used in discount validation for specific variants
 * - Determines which variants qualify for voucher
 * - Empty array means voucher applies via products/categories
 * - Used in fine-grained discount calculation
 * - Most specific voucher scope (variant level)
 *
 * @example
 * const voucher = await prisma.vouchers.findUnique({
 *   where: { id: voucherId },
 *   include: { voucherProductVariant: true }
 * });
 */
export type VoucherWithAllAppliedProductVariantsDetailInformation =
  Prisma.VouchersGetPayload<{
    include: {
      voucherForSpecialProductVariant: true;
    };
  }>;

/**
 * Customer service request with all associated media and staff information.
 *
 * Includes media attachments (photos, documents) and assigned staff member.
 * Used in customer support and request tracking.
 *
 * @remarks
 * - Includes: media array with all attachments
 * - Includes: processByStaff (customer support staff)
 * - Includes: processByStaff's userMedia (staff avatar)
 * - Used in request detail pages
 * - Used in admin request management
 * - Media URLs need conversion from S3 keys
 * - Tracks request status and staff assignment
 * - Used for support ticket management
 *
 * @example
 * const request = await prisma.requests.findUnique({
 *   where: { id: requestId },
 *   include: {
 *     media: true,
 *     processByStaff: {
 *       include: { userMedia: true }
 *     }
 *   }
 * });
 */
export type RequestsWithMedia = Prisma.RequestsGetPayload<{
  include: {
    media: true;
    processByStaff: {
      include: { userMedia: true };
    };
  };
}>;

/**
 * Product review with all media attachments (photos from customer).
 *
 * Includes review text, rating, and all media files (product photos, attachments)
 * uploaded by reviewer. Used in product reviews display.
 *
 * @remarks
 * - Includes: media array with customer-uploaded photos
 * - Used in product detail pages (reviews section)
 * - Used in review listing pages
 * - Media URLs need conversion from S3 keys
 * - Tracks customer satisfaction and feedback
 * - Media helps other customers assess product
 * - Used for product quality monitoring
 *
 * @example
 * const review = await prisma.reviews.findUnique({
 *   where: { id: reviewId },
 *   include: { media: true }
 * });
 */
export type ReviewsWithMedia = Prisma.ReviewsGetPayload<{
  include: {
    media: true;
  };
}>;

/**
 * Single shopping cart item with complete product variant and media details.
 *
 * Individual cart item including product variant (size/color),
 * media files, and quantity. Used in cart item manipulation.
 *
 * @remarks
 * - Includes: productVariant (specific size/color combination)
 * - Includes: media for the product variant
 * - Tracks: quantity, price at time of addition
 * - Used in cart item display
 * - Used in cart update operations (change quantity)
 * - Used in cart removal
 * - Media URLs need conversion from S3 keys
 * - Used in cart-related calculations
 *
 * @example
 * const cartItem = await prisma.cartItems.findUnique({
 *   where: { id: cartItemId },
 *   include: {
 *     productVariant: {
 *       include: { media: true }
 *     }
 *   }
 * });
 */
export type CartItemsWithProductVariantAndMedia = Prisma.CartItemsGetPayload<{
  include: {
    productVariant: {
      include: {
        media: true;
      };
    };
  };
}>;
