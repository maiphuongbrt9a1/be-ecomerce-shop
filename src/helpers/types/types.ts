import { DiscountType, Prisma, User } from '@prisma/client';
import {
  CalculateExpectedDeliveryTimeResponse,
  GetServiceResponse,
} from './calculate-shipping-fee';

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

/**
 * Product variant with GHN (Giao Hang Nhanh) shop ID for shipping integration.
 *
 * Includes product variant with parent product and its shop office's GHN shop ID.
 * Used when creating shipments or calculating shipping fees via GHN API.
 *
 * @remarks
 * - Includes: product relation (full product details)
 * - Includes: shopOffice relation within product
 * - Selects: ghnShopId only from shopOffice (GHN shipping provider ID)
 * - Used in shipment creation endpoint
 * - Used for GHN API integration (calculate shipping fees, create shipping orders)
 * - Required for multi-shop shipping scenarios
 * - ghnShopId maps to GHN's shop identifier for pickup location
 * - Avoids loading full shop office data (only ID needed for shipping)
 *
 * @example
 * const variant = await prisma.productVariants.findUnique({
 *   where: { id: variantId },
 *   include: {
 *     product: {
 *       include: {
 *         shopOffice: {
 *           select: { ghnShopId: true }
 *         }
 *       }
 *     }
 *   }
 * });
 * // Use variant.product.shopOffice.ghnShopId for GHN API calls
 */
export type ProductVariantsWithShopOfficeId = Prisma.ProductVariantsGetPayload<{
  include: {
    product: {
      include: {
        shopOffice: {
          select: {
            ghnShopId: true;
          };
        };
      };
    };
  };
}>;

/**
 * Package item formatted for GHN (Giao Hang Nhanh) create order API request.
 *
 * Transforms product variant data into GHN-compatible format for shipment creation.
 * Used when submitting order items to GHN's shipping API.
 *
 * @remarks
 * - Flattened structure from ProductVariant (no nested objects)
 * - `price` is the unit price per item for GHN calculation
 * - `category.level1` is GHN's product category classification
 * - All dimensions required for GHN's size/weight validation
 * - Used in shipment creation and shipping fee calculation
 * - Weight in grams, dimensions in centimeters
 *
 * @example
 * {
 *   name: "T-Shirt Red",
 *   code: "TS-RED-001",
 *   quantity: 2,
 *   price: 199000,
 *   length: 20,
 *   width: 15,
 *   height: 5,
 *   weight: 250,
 *   category: { level1: "Clothing" }
 * }
 */
export type PackageItemDetailForGHNCreateNewOrderRequest = {
  name: string;
  code: string;
  quantity: number;
  price: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  category: {
    level1: string;
  };
};

/**
 * Order line item package details with pricing and discount information.
 *
 * Internal representation of a product variant in a shipping package.
 * Includes variant details, quantity, pricing, and discount calculations.
 * Used for order processing, cart updates, and shipment preparation.
 *
 * @remarks
 * - Contains product variant identification (ID, name, size, color, SKU)
 * - Tracks quantity and unit price at time of addition
 * - Includes discount details (type, value, description) for final pricing
 * - `totalPrice` = (unitPrice * quantity)
 * - `currencyUnit` typically 'VND' for Vietnamese Dong
 * - Used in order confirmation and invoice generation
 * - Discount calculations affect final package pricing
 *
 * @example
 * {
 *   productVariantId: 123n,
 *   productVariantName: "Nike Shoes",
 *   productVariantSize: "42",
 *   productVariantColor: "Black",
 *   productVariantSKU: "NK-BLK-42",
 *   quantity: 1,
 *   unitPrice: 1200000,
 *   discountDescription: "Summer Sale 10%",
 *   discountType: "PERCENTAGE",
 *   discountValue: 10,
 *   totalPrice: 1080000,
 *   currencyUnit: "VND"
 * }
 */
export type PackageItemDetail = {
  productVariantId: bigint;
  productVariantName: string;
  productVariantSize: string;
  productVariantColor: string;
  productVariantSKU: string;
  quantity: number;
  unitPrice: number;
  discountDescription: string;
  discountType: DiscountType;
  discountValue: number;
  totalPrice: number;
  currencyUnit: string;
};

/**
 * Complete shipping package with all necessary data for shipment creation and delivery.
 *
 * Comprehensive package information for a single shop's items being shipped together.
 * Includes item details, GHN integration data, shipping service selection, and delivery timeline.
 * Used in shipment creation, shipping fee calculation, and delivery tracking.
 *
 * @remarks
 * - `packageItems`: Internal cart item representation (for order records)
 * - `packageItemsForGHNCreateNewOrderRequest`: GHN API format items
 * - Dimensions tracked separately: totalWeight (grams), totalHeight/Length/Width (cm)
 * - `ghnShopId`: Pickup location for this package (shop's GHN shop ID)
 * - `ghnShopDetail`: Complete pickup location details from GHN
 * - `ghnProvinceName/ghnDistrictName/ghnWardName`: Delivery location names (human-readable)
 * - `shippingService`: Selected GHN service (Express, Standard, Saving)
 * - `shippingFee`: Calculated cost in VND
 * - `expectedDeliveryTime`: ETA with leadtime and order_date timestamps
 * - `from_*`: Pickup location GHN IDs and codes
 * - `to_*`: Delivery location GHN IDs and codes
 * - Used in order tracking, invoice generation
 * - One package per shop (multi-shop orders = multiple packages)
 *
 * @example
 * {
 *   packageItems: [...],
 *   packageItemsForGHNCreateNewOrderRequest: [...],
 *   totalWeight: 1500,
 *   totalHeight: 20,
 *   maxLength: 30,
 *   maxWidth: 25,
 *   ghnShopId: 1001,
 *   ghnShopDetail: {...},
 *   ghnProvinceName: "TP. Hồ Chí Minh",
 *   ghnDistrictName: "Quận 1",
 *   ghnWardName: "Phường Bến Nghé",
 *   shippingService: {...},
 *   shippingFee: 35000,
 *   expectedDeliveryTime: { leadtime: 1707993600, order_date: 1707917200 },
 *   from_district_id: 1,
 *   from_ward_code: "100320",
 *   to_district_id: 3,
 *   to_ward_code: "100010"
 * }
 */
export type PackageDetail = {
  packageItems: PackageItemDetail[];
  packageItemsForGHNCreateNewOrderRequest: PackageItemDetailForGHNCreateNewOrderRequest[];
  totalWeight: number; // in grams
  totalHeight: number; // in cm
  maxLength: number; // in cm
  maxWidth: number; // in cm
  ghnShopId: number;
  ghnShopDetail: GHNShopDetail;
  ghnProvinceName: string;
  ghnDistrictName: string;
  ghnWardName: string;
  shippingService: GetServiceResponse;
  shippingFee: number; // in VND
  expectedDeliveryTime: CalculateExpectedDeliveryTimeResponse;
  from_district_id: number;
  from_ward_code: string;
  to_district_id: number;
  to_ward_code: string;
};

/**
 * All shipping packages for an order, organized by shop.
 *
 * Record of packages grouped by shop office ID (as key).
 * Each order may have multiple packages if items come from different shops.
 * Used to organize shipment data and simplify iteration over shop-grouped items.
 *
 * @remarks
 * - Key: shop office ID as string (from package grouping logic)
 * - Value: Complete PackageDetail for that shop's items
 * - Multi-shop orders require multiple shipments (one per shop)
 * - Used in shipment creation endpoint
 * - Used in shipping fee aggregation
 * - Simplifies iterating packages by shop during checkout
 *
 * @example
 * {
 *   "1001": { packageItems: [...], shippingFee: 35000 },
 *   "1002": { packageItems: [...], shippingFee: 28000 }
 * }
 */
export type PackagesForShipping = Record<string, PackageDetail>;

/**
 * GHN shop office details with location and system metadata.
 *
 * Complete shop information retrieved from GHN's system.
 * Represents a pickup location for shipments.
 * Used in shipment creation and shop location validation.
 *
 * @remarks
 * - `_id`: GHN's internal shop identifier (primary key)
 * - `name/phone/address`: Shop contact and location details
 * - `ward_code/district_id`: GHN location hierarchy codes
 * - `client_id/bank_account_id`: Shop's GHN client and payment info
 * - `status`: Shop active/inactive status (0=inactive, 1=active)
 * - `location`: Geographic coordinates (latitude/longitude object)
 * - `version_no`: System version tracking
 * - `is_created_chat_channel`: Chat support availability flag
 * - `address_v2/ward_id_v2/province_id_v2`: Updated address format
 * - `is_new_address`: Indicates if address is newly registered
 * - `updated_ip/updated_employee/updated_client/updated_source/updated_date`: Audit trail for updates
 * - `created_ip/created_employee/created_client/created_source/created_date`: Audit trail for creation
 * - Used in shipment tracking and shop identification
 * - Retrieved from GHN's get shop details API
 *
 * @example
 * {
 *   _id: 1001,
 *   name: "Main Shop",
 *   phone: "0123456789",
 *   address: "123 Nguyen Hue, District 1",
 *   ward_code: "100320",
 *   district_id: 1,
 *   client_id: 5001,
 *   status: 1,
 *   ...
 * }
 */
export type GHNShopDetail = {
  _id: number;
  name: string;
  phone: string;
  address: string;
  ward_code: string;
  district_id: number;
  client_id: number;
  bank_account_id: number;
  status: number;
  location: object;
  version_no: string;
  is_created_chat_channel: boolean;
  address_v2: string;
  ward_id_v2: number;
  province_id_v2: number;
  is_new_address: boolean;
  updated_ip: string;
  updated_employee: number;
  updated_client: number;
  updated_source: string;
  updated_date: string;
  created_ip: string;
  created_employee: number;
  created_client: number;
  created_source: string;
  created_date: string;
};

/**
 * GHN API response wrapper containing list of shops for a client account.
 *
 * Top-level response from GHN's get shops list API endpoint.
 * Contains metadata and paginated shop results.
 * Used when retrieving all available pickup locations for shipment creation.
 *
 * @remarks
 * - `code`: GHN API status code (0=success, non-zero=error)
 * - `message`: Human-readable API response message
 * - `data.last_offset`: Pagination cursor for next request (if more results)
 * - `data.shops`: Array of GHNShopDetail objects
 * - Used to populate shop selection dropdowns
 * - Used to validate shop availability for pickup
 * - Retrieved from GHN's shop management API
 *
 * @example
 * {
 *   code: 200,
 *   message: "Success",
 *   data: {
 *     last_offset: 5,
 *     shops: [
 *       { _id: 1001, name: "Main Shop", ... },
 *       { _id: 1002, name: "Branch Shop", ... }
 *     ]
 *   }
 * }
 */
export type MyGHNShopList = {
  code: number;
  message: string;
  data: {
    last_offset: number;
    shops: GHNShopDetail[];
  };
};
