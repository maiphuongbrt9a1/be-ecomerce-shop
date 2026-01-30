import { Request } from 'express';

/**
 * Extended Express Request interface with authenticated user information.
 *
 * This interface extends the standard Express Request object to include user data
 * after successful JWT authentication. Used throughout the application in protected
 * routes to access the authenticated user's information.
 *
 * @interface RequestWithUser
 * @extends {Request}
 *
 * @property {Object} user - Authenticated user information from JWT token
 * @property {bigint} user.id - Unique user identifier (BigInt for large ID support)
 * @property {string | null} user.firstName - User's first name (nullable)
 * @property {string | null} user.lastName - User's last name (nullable)
 * @property {string | null} user.name - User's full name concatenated (nullable)
 * @property {string} user.email - User's email address (unique identifier)
 * @property {string} user.role - User's role (USER, ADMIN, STAFF)
 * @property {boolean} user.isActive - Whether user account is active
 *
 * @remarks
 * - Populated by JWT authentication guard after token verification
 * - Available in @Req() decorated parameters in controllers
 * - Type-safe access to authenticated user data
 * - Used in authorization decisions and audit logging
 * - Replaces req.user from standard Express authentication
 * - Email serves as unique identifier when ID needed for queries
 * - Role used for @Roles() decorator-based authorization
 *
 * @example
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@Req() req: RequestWithUser) {
 *   return {
 *     id: req.user.id,
 *     email: req.user.email,
 *     name: req.user.name
 *   };
 * }
 */
export interface RequestWithUser extends Request {
  user: {
    id: bigint;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    email: string;
    role: string;
    isActive: boolean;
  };
}

/**
 * Utility type extracting user object from RequestWithUser.
 *
 * This type provides convenient access to just the user data without needing
 * to reference the full Request object. Simplifies type annotations in functions
 * that only need user information.
 *
 * @typedef {RequestWithUser['user']} UserInRequestWithUser
 *
 * @remarks
 * - Extracts the user property type from RequestWithUser interface
 * - Used for cleaner parameter typing in service functions
 * - Same structure as RequestWithUser.user
 * - More readable than RequestWithUser['user'] in type annotations
 *
 * @example
 * function getUserEmail(user: UserInRequestWithUser): string {
 *   return user.email;
 * }
 */
export type UserInRequestWithUser = RequestWithUser['user'];

/**
 * Extended Express Request interface for JWT strategy authentication flow.
 *
 * This interface represents the request object within JWT authentication strategy
 * (Passport-JWT). Used in the JWT strategy validation to provide access to
 * authenticated user data extracted from JWT token payload.
 *
 * @interface RequestWithUserInJWTStrategy
 * @extends {Request}
 *
 * @property {Object} user - User information extracted from JWT token payload
 * @property {bigint} user.userId - User's unique identifier from JWT (BigInt)
 * @property {string} user.username - User's email address used as unique username
 * @property {string} user.role - User's role from JWT (USER, ADMIN, STAFF)
 * @property {string | null} user.firstName - User's first name from JWT (nullable)
 * @property {string | null} user.lastName - User's last name from JWT (nullable)
 * @property {string | null} user.name - User's full name from JWT (nullable)
 *
 * @remarks
 * - Used internally in Passport JWT strategy (passport-jwt)
 * - Different field names from RequestWithUser (userId vs id, username vs email)
 * - Represents JWT payload structure directly
 * - Converted to RequestWithUser in JWT guard for consistency
 * - Used in JWT strategy validation callback
 * - userId stored as 'sub' field in JWT token
 * - username equals email from authentication payload
 *
 * @example
 * // In JWT strategy:
 * return {
 *   userId: payload.sub,
 *   username: payload.username,
 *   role: payload.role,
 *   firstName: payload.firstName,
 *   lastName: payload.lastName,
 *   name: payload.name
 * };
 */
export interface RequestWithUserInJWTStrategy extends Request {
  user: {
    userId: bigint;
    username: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
  };
}

/**
 * Utility type extracting user object from RequestWithUserInJWTStrategy.
 *
 * This type provides convenient access to JWT strategy user data. Used in
 * Passport JWT strategy callbacks and related authentication logic where
 * the JWT strategy user structure is needed.
 *
 * @typedef {RequestWithUserInJWTStrategy['user']} UserInRequestWithUserInJWTStrategy
 *
 * @remarks
 * - Extracts the user property type from RequestWithUserInJWTStrategy interface
 * - Used in JWT strategy validation and conversion logic
 * - Separate from UserInRequestWithUser for type safety
 * - Allows parallel typing of JWT and converted user objects
 * - Used when working with Passport JWT internals
 *
 * @example
 * function convertJWTUserToRequestUser(
 *   jwtUser: UserInRequestWithUserInJWTStrategy
 * ): UserInRequestWithUser {
 *   return {
 *     id: jwtUser.userId,
 *     email: jwtUser.username,
 *     ...jwtUser
 *   };
 * }
 */
export type UserInRequestWithUserInJWTStrategy =
  RequestWithUserInJWTStrategy['user'];
