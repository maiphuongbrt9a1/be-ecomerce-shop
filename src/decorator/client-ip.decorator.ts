import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Extract and normalize the client IP address from an incoming HTTP request.
 *
 * This decorator resolves the most reliable client IP by checking common proxy headers
 * and request-level network properties in priority order, then normalizes the result
 * for downstream integrations (for example VNPay) that prefer IPv4 format.
 *
 * Resolution priority:
 * 1. First IP from `x-forwarded-for`
 * 2. `x-real-ip`
 * 3. `request.ip`
 * 4. `request.socket.remoteAddress`
 * 5. Empty string fallback
 *
 * Normalization rules:
 * - Trims surrounding whitespace
 * - Converts IPv6 loopback `::1` to IPv4 loopback `127.0.0.1`
 * - Converts IPv4-mapped IPv6 values like `::ffff:192.168.1.10` to `192.168.1.10`
 *
 * @param {unknown} data - Optional decorator data (unused)
 * @param {ExecutionContext} ctx - NestJS execution context containing the current request
 *
 * @returns {string} Normalized client IP address, or empty string when unavailable
 *
 * @remarks
 * - To trust proxy headers correctly in production, ensure Express/Nest proxy settings
 *   are configured for your deployment topology.
 * - For `x-forwarded-for`, only the first address is used because it represents the
 *   original client in standard proxy chains.
 */
export const ClientIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const forwardedFor = request.headers['x-forwarded-for'];
    const xRealIp = request.headers['x-real-ip'];

    const normalizeIp = (value: string): string => {
      const ip = value.trim();

      if (!ip) {
        return '';
      }

      // Keep VNPay-facing IP in IPv4 format when possible.
      if (ip === '::1') {
        return '127.0.0.1';
      }

      if (ip.startsWith('::ffff:')) {
        return ip.slice(7);
      }

      return ip;
    };

    const firstForwardedIp =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0]
        : Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : '';

    const candidateIp =
      firstForwardedIp ||
      (typeof xRealIp === 'string' ? xRealIp : '') ||
      request.ip ||
      request.socket?.remoteAddress ||
      '';

    return normalizeIp(candidateIp);
  },
);
