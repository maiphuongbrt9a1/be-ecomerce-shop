import { RESPONSE_MESSAGE } from '@/decorator/customize';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Generic response interface for standardized API responses.
 *
 * This interface defines the structure of all HTTP responses returned by the application.
 * It ensures consistent response formatting across all endpoints.
 *
 * @template T - The type of data in the response
 * @property {number} statusCode - The HTTP status code (200, 400, 500, etc.)
 * @property {string} [message] - Optional response message (from @CustomResponse decorator)
 * @property {any} data - The actual response data/payload returned by the controller
 *
 * @remarks
 * - All API responses follow this structure
 * - Message is optional and comes from RESPONSE_MESSAGE metadata
 * - Data field contains the actual payload returned by controller methods
 * - Used by TransformInterceptor to wrap controller responses
 *
 * @example
 * // Response example:
 * {
 *   statusCode: 200,
 *   message: "User created successfully",
 *   data: { id: 1, email: "user@example.com" }
 * }
 */
export interface Response<T> {
  statusCode: number;
  message?: string;
  data: any;
}

/**
 * Global response transformation interceptor for standardizing API responses.
 *
 * This interceptor intercepts all controller responses and wraps them in a standardized
 * response format containing status code, optional message, and data payload. It applies
 * to all routes automatically through NestJS interceptor binding.
 *
 * @implements {NestInterceptor<T, Response<T>>}
 *
 * @remarks
 * - Applied globally to all HTTP endpoints
 * - Extracts RESPONSE_MESSAGE from @CustomResponse decorator if present
 * - Always includes HTTP status code in response
 * - Ensures consistent response format across entire API
 * - Used for both successful and error responses
 * - Works with generic type T to preserve type information
 *
 * @example
 * // Controller method:
 * @Post()
 * @CustomResponse('User created successfully')
 * create(@Body() createUserDto: CreateUserDto) {
 *   return newUser; // Returns { id: 1, email: "..." }
 * }
 * // Interceptor transforms to:
 * {
 *   statusCode: 201,
 *   message: "User created successfully",
 *   data: { id: 1, email: "..." }
 * }
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  /**
   * Initializes the TransformInterceptor with Reflector dependency.
   *
   * This constructor performs the following operations:
   * 1. Injects the Reflector service from NestJS core
   * 2. Stores Reflector for accessing decorator metadata
   * 3. Enables retrieval of RESPONSE_MESSAGE from @CustomResponse decorator
   *
   * @param {Reflector} reflector - NestJS Reflector service for accessing metadata
   *   from decorators (used to retrieve RESPONSE_MESSAGE from @CustomResponse)
   *
   * @remarks
   * - Reflector enables access to custom decorator metadata
   * - Allows reading RESPONSE_MESSAGE set via @CustomResponse decorator
   * - Service injected automatically by NestJS dependency injection
   */
  constructor(private reflector: Reflector) {}

  /**
   * Intercepts HTTP responses and transforms them into standardized format.
   *
   * This method performs the following operations:
   * 1. Calls the next handler to get the controller response
   * 2. Extracts HTTP status code from response object
   * 3. Retrieves custom message from RESPONSE_MESSAGE metadata (if exists)
   * 4. Wraps the response data in standardized Response interface
   * 5. Returns transformed response through RxJS Observable
   *
   * @param {ExecutionContext} context - NestJS execution context providing access to:
   *   - Request, response, and handler metadata
   *   - Current HTTP context and execution information
   * @param {CallHandler} next - CallHandler that invokes the next middleware/handler
   *   in the request pipeline and returns the controller's response
   *
   * @returns {Observable<Response<T>>} Observable stream of transformed response with:
   *   - statusCode: HTTP status code from response object
   *   - message: Custom message from @CustomResponse decorator (or empty string if not set)
   *   - data: Original controller response data wrapped in Response interface
   *
   * @throws {Any} Re-throws any errors from the next handler (controller)
   *
   * @remarks
   * - Executes AFTER controller handler completes
   * - Uses RxJS pipe and map operator for transformation
   * - Message is optional - defaults to empty string if no @CustomResponse decorator
   * - Preserves type information through generic T parameter
   * - Handles all response types (strings, objects, arrays, primitives)
   * - Executed for every endpoint in the application
   * - Transforms both successful responses and error responses
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        message:
          this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) ||
          '',
        data: data,
      })),
    );
  }
}
