import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClientIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const ip =
      (request.headers['x-forwarded-for'] || '').split(',')[0] || request.ip;
    return ip;
  },
);
