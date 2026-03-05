import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReturnQueryFromVNPayDto } from './verify-vnpay-return-url.dto';

export class VerifyIpnCallOptionsDto {
  @ApiPropertyOptional({
    description: 'Whether the secure hash is included in data',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  withHash?: boolean;

  @ApiPropertyOptional({
    description:
      'Logger options (can be {type: "all"}, {type: "omit", fields: [...]}, or {type: "pick", fields: [...]})',
    example: { type: 'all' },
  })
  @IsOptional()
  @IsObject()
  logger?: {
    type?: 'all' | 'omit' | 'pick';
    fields?: string[];
    loggerFn?: any;
  };
}

export class VerifyVNPayIPNCallDto {
  @ApiProperty({
    description: 'IPN query data from VNPAY callback',
    type: ReturnQueryFromVNPayDto,
  })
  @ValidateNested()
  @Type(() => ReturnQueryFromVNPayDto)
  data: ReturnQueryFromVNPayDto;

  @ApiPropertyOptional({
    description: 'Optional IPN verification options',
    type: VerifyIpnCallOptionsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => VerifyIpnCallOptionsDto)
  options?: VerifyIpnCallOptionsDto;
}
