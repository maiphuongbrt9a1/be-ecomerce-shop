import { Logger } from '@nestjs/common';
import { Media } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  OrdersWithFullInformation,
  ShipmentsWithFullInformation,
} from './types/types';
const saltOrRounds = 10;

export const hashPasswordHelper = async (plainPassword: string) => {
  try {
    return await bcrypt.hash(plainPassword, saltOrRounds);
  } catch (error) {
    console.log(error);
    throw new Error('Hash password failed!');
  }
};

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
    order.processByStaff.userMedia = formatMediaFieldWithLogging(
      order.processByStaff.userMedia,
      buildPublicMediaUrl,
      'user',
      order.processByStaff.id,
      logger,
    );

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
      order.requests[k].processByStaff.userMedia = formatMediaFieldWithLogging(
        order.requests[k].processByStaff.userMedia,
        buildPublicMediaUrl,
        'user',
        order.requests[k].processByStaff.id,
        logger,
      );
    }

    // convert shipment media field
    for (let l = 0; l < order.shipments.length; l++) {
      order.shipments[l].processByStaff.userMedia = formatMediaFieldWithLogging(
        order.shipments[l].processByStaff.userMedia,
        buildPublicMediaUrl,
        'shipment',
        order.shipments[l].id,
        logger,
      );
    }
  }
  logger.log('Completed media field formatting for orders.');
  return orders;
};

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
