import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

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
