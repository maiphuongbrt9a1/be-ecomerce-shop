import { BadRequestException, SetMetadata } from '@nestjs/common';
import { Transform } from 'class-transformer';

/**
 * Metadata key for identifying public routes that bypass authentication.
 *
 * Used to mark controller methods that should not require JWT token validation.
 * The JWT guard checks this metadata key to skip authentication for public endpoints.
 *
 * @remarks
 * - Key value is 'isPublic' for metadata storage
 * - Used in conjunction with @Public() decorator
 * - Guards check this key to allow unauthenticated access
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a controller method/class as publicly accessible without authentication.
 *
 * This decorator performs the following operations:
 * 1. Sets metadata with IS_PUBLIC_KEY to true
 * 2. Signals to JWT guard to skip authentication
 * 3. Allows unauthenticated users to access the endpoint
 *
 * @returns {MethodDecorator | ClassDecorator} NestJS decorator function
 *
 * @remarks
 * - Applied to controller methods or classes
 * - Bypasses JWT authentication guard
 * - Used for login, registration, and public endpoints
 * - Guard must explicitly check IS_PUBLIC_KEY
 *
 * @example
 * @Post('login')
 * @Public()
 * login(@Body() credentials: LoginDto) {
 *   return this.authService.login(credentials);
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Metadata key for role-based access control authorization.
 *
 * Stores allowed roles for a route. Authorization guard checks this to verify
 * the authenticated user has one of the required roles.
 *
 * @remarks
 * - Key value is 'roles' for metadata storage
 * - Used with @Roles() decorator
 * - Guard validates user role against allowed roles
 */
export const ROLES_KEY = 'roles';

/**
 * Marks a controller method with required roles for access.
 *
 * This decorator performs the following operations:
 * 1. Accepts variable number of role strings
 * 2. Sets metadata with ROLES_KEY to array of roles
 * 3. Signals to authorization guard which roles are allowed
 * 4. Guard verifies authenticated user has one of these roles
 *
 * @param {...string[]} roles - Allowed role names (e.g., 'ADMIN', 'USER', 'STAFF')
 *
 * @returns {MethodDecorator} NestJS decorator function
 *
 * @throws {Unauthorized} When user role not in allowed roles
 *
 * @remarks
 * - Applied only to controller methods
 * - Requires @UseGuards(RolesGuard) on controller or method
 * - User must be authenticated first (use with private routes)
 * - Multiple roles allowed - user needs any one
 * - Guard compares user.role with roles array
 *
 * @example
 * @Get('admin/users')
 * @UseGuards(JwtGuard, RolesGuard)
 * @Roles('ADMIN')
 * getUsers() {
 *   return this.userService.findAll();
 * }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Metadata key for custom response messages attached to responses.
 *
 * Stores custom success messages that TransformInterceptor includes in responses.
 * Allows controllers to customize the message field of standardized responses.
 *
 * @remarks
 * - Key value is 'response_message' for metadata storage
 * - Used with @ResponseMessage() decorator
 * - TransformInterceptor reads this metadata
 */
export const RESPONSE_MESSAGE = 'response_message';

/**
 * Adds custom message to API response envelope.
 *
 * This decorator performs the following operations:
 * 1. Accepts custom message string
 * 2. Sets metadata with RESPONSE_MESSAGE key
 * 3. TransformInterceptor reads this message
 * 4. Message included in response JSON
 *
 * @param {string} message - Custom message to include in response
 *   (e.g., "User created successfully", "Password changed")
 *
 * @returns {MethodDecorator} NestJS decorator function
 *
 * @remarks
 * - Applied to controller methods
 * - Message included in all responses (success and error)
 * - Optional - no message if not applied
 * - Improves API usability with descriptive messages
 * - Message appears in response.message field
 *
 * @example
 * @Post('register')
 * @ResponseMessage('User registered successfully')
 * register(@Body() createUserDto: CreateUserDto) {
 *   return this.authService.register(createUserDto);
 * }
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);

/**
 * Transforms empty strings to undefined for DTO validation.
 *
 * This decorator performs the following operations:
 * 1. Checks if input value is empty string
 * 2. Converts empty string to undefined
 * 3. Returns value unchanged if not empty string
 * 4. Applied during class transformation
 *
 * @returns {PropertyDecorator} Class-transformer decorator function
 *
 * @remarks
 * - Applied to DTO class properties
 * - Used with @Transform from class-transformer
 * - Converts empty strings to undefined for cleaner validation
 * - Allows @IsOptional() to work correctly
 * - Executed during DTO transformation only
 * - Does not affect null or other falsy values
 *
 * @example
 * export class UpdateUserDto {
 *   @TransformEmptyToUndefined()
 *   @IsOptional()
 *   @IsString()
 *   description?: string;
 * }
 * // Input: { description: '' } → { description: undefined }
 */
export const TransformEmptyToUndefined = () =>
  Transform(({ value }) => (value === '' ? undefined : value));

/**
 * Transforms string or number values to BigInt type.
 *
 * This transformer performs the following operations:
 * 1. Validates input is not empty/null/undefined
 * 2. Attempts to convert string to BigInt using BigInt()
 * 3. Converts numbers to BigInt directly
 * 4. Returns existing BigInt values unchanged
 * 5. Returns null for invalid inputs
 * 6. Throws error for invalid string conversions
 *
 * @returns {PropertyDecorator} Class-transformer decorator function
 *
 * @param {string | number | bigint | undefined | null} value - The value to transform
 *
 * @throws {Error} If string cannot be converted to valid BigInt
 *   Error message: "Invalid voucherId: \"[value]\" cannot be converted to BigInt"
 *
 * @remarks
 * - Applied to DTO properties expecting BigInt values
 * - Handles multiple input types (string, number, bigint)
 * - Used for IDs stored as BigInt in database
 * - Executes during class transformation only (toClassOnly: true)
 * - Empty string, null, and undefined return null
 * - Used primarily for voucherId and similar large ID fields
 * - Validates conversion and throws on invalid strings
 *
 * @example
 * export class CreateOrderDto {
 *   @TransformStringToBigint()
 *   @IsString()
 *   voucherId: bigint;
 * }
 * // Input: { voucherId: '123456789' } → { voucherId: 123456789n }
 * // Input: { voucherId: 123456789 } → { voucherId: 123456789n }
 * // Input: { voucherId: 'invalid' } → throws Error
 */
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

/**
 * Transforms media ID input into BigInt array for deletion operations.
 *
 * This transformer performs the following operations:
 * 1. Returns undefined if input is undefined or null
 * 2. Converts array of values to BigInt array
 * 3. Parses JSON string format (e.g., "[59,60]") to array
 * 4. Splits comma-separated strings (e.g., "59,60") into array
 * 5. Converts scalar values (number, string, bigint) to single-element array
 * 6. Maps all array elements to BigInt type
 * 7. Throws BadRequestException for invalid JSON
 * 8. Returns empty array for empty input
 *
 * @returns {PropertyDecorator} Class-transformer decorator function
 *
 * @param {string | number | bigint | any[] | undefined | null} value - The value to transform:
 *   - array: [59, '60', 123n] → [59n, 60n, 123n]
 *   - JSON string: "[59,60]" → [59n, 60n]
 *   - comma-separated: "59,60" → [59n, 60n]
 *   - single: "59" or 59 or 59n → [59n]
 *   - undefined/null: undefined → undefined
 *
 * @returns {bigint[] | undefined} Array of BigInt IDs or undefined
 *
 * @throws {BadRequestException} If JSON string is malformed:
 *   Error message: "mediaIdsToDelete must be an array of big integers or a stringified array"
 *
 * @remarks
 * - Applied to DTO properties for media deletion IDs
 * - Handles multiple input formats for flexibility
 * - Converts all elements to BigInt for database consistency
 * - Executes during class transformation only (toClassOnly: true)
 * - Returns undefined (not empty array) for undefined/null input
 * - Used for bulk media deletion operations
 * - Filters out empty strings and whitespace
 * - Supports flexible client input formats
 *
 * @example
 * export class UpdateProductVariantDto {
 *   @TransformMediaIdsToDeleteArrayFromStringArrayToBigintArray()
 *   @IsArray()
 *   mediaIdsToDelete?: bigint[];
 * }
 * // Input: { mediaIdsToDelete: '[59,60]' } → { mediaIdsToDelete: [59n, 60n] }
 * // Input: { mediaIdsToDelete: '59,60' } → { mediaIdsToDelete: [59n, 60n] }
 * // Input: { mediaIdsToDelete: [59, '60'] } → { mediaIdsToDelete: [59n, 60n] }
 * // Input: { mediaIdsToDelete: undefined } → { mediaIdsToDelete: undefined }
 */
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
