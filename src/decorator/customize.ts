import { BadRequestException, SetMetadata } from '@nestjs/common';
import { Transform } from 'class-transformer';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const RESPONSE_MESSAGE = 'response_message';
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);

export const TransformEmptyToUndefined = () =>
  Transform(({ value }) => (value === '' ? undefined : value));

export const TransformStringToBigint = () =>
  Transform(
    ({ value }) => {
      // Convert empty string to null
      if (value === '' || value === null || value === undefined) {
        return null;
      }

      // Convert string/number to BigInt
      if (typeof value === 'string') {
        try {
          return BigInt(value);
        } catch {
          throw new Error(
            `Invalid voucherId: "${value}" cannot be converted to BigInt`,
          );
        }
      }

      if (typeof value === 'number') {
        return BigInt(value);
      }

      if (typeof value === 'bigint') {
        return value;
      }

      return null;
    },
    { toClassOnly: true },
  );

export const TransformMediaIdsToDeleteArrayFromStringArrayToBigintArray = () =>
  Transform(
    ({ value }) => {
      if (value === undefined || value === null) return undefined;

      // already an array -> map to BigInt
      if (Array.isArray(value)) {
        return value.map((v) => {
          if (typeof v === 'bigint') return v;
          if (typeof v === 'number') return BigInt(v);
          return BigInt(String(v));
        });
      }

      // string input: try JSON.parse (e.g. "[59,60]") or comma-separated ("59,60")
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.startsWith('[')) {
          try {
            const parsed: any = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              return parsed.map((v) => BigInt(v));
            }
          } catch {
            // fallthrough to comma split
            throw new BadRequestException(
              'mediaIdsToDelete must be an array of big integers or a stringified array',
            );
          }
        }
        // comma separated or single scalar string
        const parts = trimmed
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (parts.length === 0) return [];
        return parts.map((p) => BigInt(p));
      }

      // scalar non-string (number, bigint, etc.)
      return [BigInt(value as any)];
    },
    { toClassOnly: true },
  );
