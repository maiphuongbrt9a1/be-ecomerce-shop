import { Logger } from '@nestjs/common';
import { Media } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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
