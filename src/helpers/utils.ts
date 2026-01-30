import { Logger } from '@nestjs/common';
import { Media } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  OrdersWithFullInformation,
  ShipmentsWithFullInformation,
} from './types/types';
const saltOrRounds = 10;

/**
 * Hash a plain text password using bcrypt algorithm.
 *
 * Converts plaintext password into a cryptographically secure hash.
 * Used during user registration and password change operations.
 *
 * 1. Receives plain text password from user input
 * 2. Generates bcrypt salt with configured rounds (10)
 * 3. Hashes password with salt using bcrypt.hash()
 * 4. Returns hashed password for database storage
 * 5. Throws error if hashing process fails
 *
 * @param {string} plainPassword - The plain text password to hash
 *
 * @returns {Promise<string>} Bcrypt hashed password string (60 characters)
 *
 * @throws {Error} 'Hash password failed!' - If bcrypt hashing operation fails
 *
 * @remarks
 * - Uses bcrypt with 10 salt rounds for security
 * - Should never store plain passwords in database
 * - Hash is one-way; cannot be reversed to get original password
 * - Used in auth.service.ts for user registration
 * - Each call generates unique hash (different salt each time)
 * - Takes ~100ms per hash call (intentional slowness for security)
 *
 * @example
 * const hashedPassword = await hashPasswordHelper('user@password123');
 * // Store hashedPassword in database
 */
export const hashPasswordHelper = async (plainPassword: string) => {
  try {
    return await bcrypt.hash(plainPassword, saltOrRounds);
  } catch (error) {
    console.log(error);
    throw new Error('Hash password failed!');
  }
};

/**
 * Compare a plain text password with a bcrypt hash.
 *
 * Verifies if provided plain text password matches the stored bcrypt hash.
 * Used during user login and password verification operations.
 *
 * 1. Receives plain text password from user input
 * 2. Receives bcrypt hash from database
 * 3. Uses bcrypt.compare() to verify password against hash
 * 4. Returns boolean result of comparison
 * 5. Throws error if comparison process fails
 *
 * @param {string} plainPassword - Plain text password from user login
 * @param {string} hashPassword - Bcrypt hash stored in database
 *
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 *
 * @throws {Error} 'Invalid password!' - If bcrypt comparison operation fails
 *
 * @remarks
 * - Bcrypt comparison is timing-resistant (prevents timing attacks)
 * - Returns false for non-matching passwords (does not throw)
 * - Used in auth.service.ts for login validation
 * - Used for password reset verification
 * - Used in user.service.ts for password change
 * - Comparison takes ~100ms (matches hash time intentionally)
 *
 * @example
 * const isMatch = await comparePasswordHelper('user@password123', storedHash);
 * if (isMatch) {
 *   // Grant access
 * } else {
 *   // Deny access
 * }
 */
export const comparePasswordHelper = async (
  plainPassword: string,
  hashPassword: string,
) => {
  try {
    return await bcrypt.compare(plainPassword, hashPassword);
  } catch (error) {
    console.log(error);
    throw new Error('Invalid password!');
  }
};

/**
 * Convert S3 storage keys to public media URLs.
 *
 * Transforms array of Media objects by converting storage keys to full URLs.
 * Used when returning media in API responses.
 *
 * 1. Checks if media array is empty or null
 * 2. Maps each Media object in array
 * 3. Calls buildPublicMediaUrl for each media URL
 * 4. Returns new Media array with converted URLs
 * 5. Returns empty array if no media provided
 *
 * @param {Media[] | []} medias - Array of Media objects with S3 keys as URLs
 * @param {(url: string) => string} buildPublicMediaUrl - Function to convert S3 key to public URL
 *
 * @returns {Media[] | []} Media array with public URLs instead of S3 keys
 *
 * @remarks
 * - Returns early if media array is empty
 * - Does not modify original media array (creates new array)
 * - Each media object maintains all fields (id, type, createdAt, etc.)
 * - Only the 'url' field is transformed
 * - Used in product-variants, reviews, requests, shipments endpoints
 * - S3 key example: 'products/variant/12345.jpg'
 * - Public URL example: 'https://cdn.example.com/products/variant/12345.jpg'
 *
 * @example
 * const mediaWithUrls = formatMediaField(
 *   mediaArray,
 *   (key) => awsService.buildPublicMediaUrl(key)
 * );
 */
export const formatMediaField = (
  medias: Media[] | [],
  buildPublicMediaUrl: (url: string) => string,
): Media[] | [] => {
  if (medias && medias.length == 0) {
    return medias;
  } else if (medias && medias.length > 0) {
    return medias.map((m: Media) => {
      return {
        ...m,
        url: buildPublicMediaUrl(m.url),
      };
    });
  }
  return [];
};

// old code to change url media field when not have formatMediaFieldWithLogging function
// this is an example usage in product-variants.service.ts
// const originalMedia = productVariant.media; // Store original media for comparison
// productVariant.media = formatMediaField(
//   productVariant.media,
//   (url: string) => this.awsService.buildPublicMediaUrl(url),
// );

// // Check if the media field has changed
// if (originalMedia !== productVariant.media) {
//   this.logger.log(
//     `Media field changed for product variant ID: ${productVariant.id}`,
//   );
// }

/**
 * Convert media URLs and log changes when media field is modified.
 *
 * Wraps formatMediaField with logging to track media transformations.
 * Used for debugging and monitoring media field conversions.
 *
 * 1. Stores reference to original media array
 * 2. Calls formatMediaField to convert media URLs
 * 3. Compares original with converted media using reference equality
 * 4. Logs message if media array reference changed
 * 5. Returns converted media array
 *
 * @param {Media[] | []} medias - Array of Media objects with S3 keys
 * @param {(url: string) => string} buildPublicMediaUrl - Function to convert S3 key to public URL
 * @param {string} entityType - Type of entity (e.g., 'user', 'product variant', 'request')
 * @param {number | bigint} entityId - ID of the entity for logging context
 * @param {Logger} logger - NestJS Logger instance for logging messages
 *
 * @returns {Media[] | []} Media array with public URLs and logging applied
 *
 * @remarks
 * - Uses reference equality to detect media array changes
 * - Logs entity type and ID for easier debugging
 * - entityType used in multiple media formatting functions
 * - Helps track which entities have media transformations
 * - Used as building block for order and shipment media formatting
 * - Log level is 'log' (informational)
 *
 * @example
 * const convertedMedia = formatMediaFieldWithLogging(
 *   productVariant.media,
 *   (key) => awsService.buildPublicMediaUrl(key),
 *   'product variant',
 *   productVariant.id,
 *   logger
 * );
 */
export const formatMediaFieldWithLogging = (
  medias: Media[] | [],
  buildPublicMediaUrl: (url: string) => string,
  entityType: string,
  entityId: number | bigint,
  logger: Logger,
): Media[] | [] => {
  const originalMedia = medias;
  const convertedMedia = formatMediaField(medias, (url: string) =>
    buildPublicMediaUrl(url),
  );

  if (originalMedia !== convertedMedia) {
    logger.log(`Media field changed for ${entityType} ID: ${entityId}`);
  }

  return convertedMedia;
};

/**
 * Convert all media URLs in orders and nested related entities.
 *
 * Recursively converts media URLs for orders including user, staff, items,
 * requests, and shipments. Processes all nested media relations in order.
 *
 * 1. Iterates through each order in orders array
 * 2. Converts user media URLs using formatMediaFieldWithLogging
 * 3. Converts processByStaff user media if staff assigned
 * 4. Converts product variant media for each order item
 * 5. Converts request media and associated staff media
 * 6. Converts shipment staff media for fulfillment tracking
 * 7. Returns orders array with all media URLs converted
 *
 * @param {OrdersWithFullInformation[]} orders - Array of orders with complete information
 * @param {(url: string) => string} buildPublicMediaUrl - Function to convert S3 keys to public URLs
 * @param {Logger} logger - NestJS Logger instance for tracking conversions
 *
 * @returns {OrdersWithFullInformation[]} Orders array with all nested media URLs converted
 *
 * @remarks
 * - Mutates original orders array (modifies in place)
 * - Logs start and completion of media formatting
 * - Handles null/undefined staff members gracefully
 * - Processes media for: user, processByStaff, orderItems, requests, shipments
 * - Each nested entity's media converted using formatMediaFieldWithLogging
 * - Used in orders.service.ts for findAll() and findOne() endpoints
 * - Ensures all S3 keys converted before sending to frontend
 * - Logging helps trace media conversion performance
 *
 * @example
 * const orders = await prisma.orders.findMany({
 *   include: OrdersWithFullInformationInclude
 * });
 * const convertedOrders = formatMediaFieldWithLoggingForOrders(
 *   orders,
 *   (key) => awsService.buildPublicMediaUrl(key),
 *   logger
 * );
 */
export const formatMediaFieldWithLoggingForOrders = (
  orders: OrdersWithFullInformation[],
  buildPublicMediaUrl: (url: string) => string,
  logger: Logger,
) => {
  logger.log(`Starting media field formatting for orders...`);
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    // convert user media field
    order.user.userMedia = formatMediaFieldWithLogging(
      order.user.userMedia,
      buildPublicMediaUrl,
      'user',
      order.user.id,
      logger,
    );

    // convert staff process user media field
    if (order.processByStaff) {
      order.processByStaff.userMedia = formatMediaFieldWithLogging(
        order.processByStaff.userMedia,
        buildPublicMediaUrl,
        'user',
        order.processByStaff.id,
        logger,
      );
    }
    // convert product variant media field
    for (let j = 0; j < order.orderItems.length; j++) {
      order.orderItems[j].productVariant.media = formatMediaFieldWithLogging(
        order.orderItems[j].productVariant.media,
        buildPublicMediaUrl,
        'product variant',
        order.orderItems[j].productVariant.id,
        logger,
      );
    }

    // convert request media field
    for (let k = 0; k < order.requests.length; k++) {
      // convert media field of request
      order.requests[k].media = formatMediaFieldWithLogging(
        order.requests[k].media,
        buildPublicMediaUrl,
        'request',
        order.requests[k].id,
        logger,
      );

      // convert processByStaff user media field of request
      const processByStaff = order.requests[k].processByStaff;
      if (processByStaff) {
        processByStaff.userMedia = formatMediaFieldWithLogging(
          processByStaff.userMedia,
          buildPublicMediaUrl,
          'user',
          processByStaff.id,
          logger,
        );
      }
    }

    // convert shipment media field
    for (let l = 0; l < order.shipments.length; l++) {
      const processByStaff = order.shipments[l].processByStaff;
      if (processByStaff) {
        processByStaff.userMedia = formatMediaFieldWithLogging(
          processByStaff.userMedia,
          buildPublicMediaUrl,
          'shipment',
          order.shipments[l].id,
          logger,
        );
      }
    }
  }
  logger.log('Completed media field formatting for orders.');
  return orders;
};

/**
 * Convert all media URLs in shipments and associated orders.
 *
 * Recursively converts media URLs for shipments including staff and complete order.
 * Reuses order media formatting to handle nested order media.
 *
 * 1. Iterates through each shipment in shipments array
 * 2. Converts processByStaff user media if staff assigned
 * 3. Converts all nested order media using formatMediaFieldWithLoggingForOrders
 * 4. Returns shipments array with all media URLs converted
 * 5. Logs start and completion of media formatting
 *
 * @param {ShipmentsWithFullInformation[]} shipments - Array of shipments with full order info
 * @param {(url: string) => string} buildPublicMediaUrl - Function to convert S3 keys to public URLs
 * @param {Logger} logger - NestJS Logger instance for tracking conversions
 *
 * @returns {ShipmentsWithFullInformation[]} Shipments array with all nested media URLs converted
 *
 * @throws {Error} Propagates errors from order media formatting
 *
 * @remarks
 * - Mutates original shipments array (modifies in place)
 * - Logs start and completion of media formatting
 * - Handles null/undefined shipment staff gracefully
 * - Delegates order media conversion to formatMediaFieldWithLoggingForOrders
 * - Used in shipments.service.ts for findAll() and findOne() endpoints
 * - Converts media for: shipment staff, complete nested order
 * - Ensures all S3 keys converted before sending to frontend
 * - Order media conversion handles all order nested entities recursively
 *
 * @example
 * const shipments = await prisma.shipments.findMany({
 *   include: {
 *     processByStaff: { include: { userMedia: true } },
 *     order: { include: OrdersWithFullInformationInclude }
 *   }
 * });
 * const convertedShipments = formatMediaFieldWithLoggingForShipments(
 *   shipments,
 *   (key) => awsService.buildPublicMediaUrl(key),
 *   logger
 * );
 */
export const formatMediaFieldWithLoggingForShipments = (
  shipments: ShipmentsWithFullInformation[],
  buildPublicMediaUrl: (url: string) => string,
  logger: Logger,
) => {
  logger.log(`Starting media field formatting for shipments...`);
  for (let index = 0; index < shipments.length; index++) {
    const shipment = shipments[index];
    // convert processByStaff user media field
    if (shipment.processByStaff && shipment.processByStaff.userMedia) {
      shipment.processByStaff.userMedia = formatMediaFieldWithLogging(
        shipment.processByStaff.userMedia,
        buildPublicMediaUrl,
        'user',
        shipment.processByStaff.id,
        logger,
      );
    }

    // convert order user media field
    if (shipment.order) {
      shipment.order = formatMediaFieldWithLoggingForOrders(
        [shipment.order],
        buildPublicMediaUrl,
        logger,
      )[0];
    }
  }
  logger.log('Completed media field formatting for shipments.');
  return shipments;
};
