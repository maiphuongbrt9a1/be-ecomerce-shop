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

export const formatMediaFieldForProductVariant = (
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
