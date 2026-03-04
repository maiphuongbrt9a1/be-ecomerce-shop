import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUrl,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BuildPaymentUrlDto {
  @ApiProperty({
    description:
      'Payment amount (library will convert to VNPay unit: amount * 100)',
    example: 150000,
    type: Number,
  })
  @IsNumber()
  vnp_Amount: number;

  @ApiProperty({
    description: 'Payment description (Vietnamese without accents)',
    example: 'Thanh toan don hang 12345',
  })
  @IsString()
  vnp_OrderInfo: string;

  @ApiProperty({
    description: 'Merchant transaction reference (must be unique per day)',
    example: 'ORDER_12345',
  })
  @IsString()
  vnp_TxnRef: string;

  @ApiProperty({
    description: 'Customer IP address',
    example: '13.160.92.202',
  })
  @IsString()
  vnp_IpAddr: string;

  @ApiProperty({
    description: 'Return callback URL after payment',
    example: 'https://your-domain.com/payments/vnpay-return',
  })
  @IsUrl()
  vnp_ReturnUrl: string;

  @ApiPropertyOptional({
    description: 'Optional create time format yyyyMMddHHmmss (GMT+7)',
    example: 20260303153000,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  vnp_CreateDate?: number;

  @ApiPropertyOptional({
    description: 'Optional expire time format yyyyMMddHHmmss (GMT+7)',
    example: 20260304153000,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  vnp_ExpireDate?: number;

  @ApiPropertyOptional({
    description: 'Currency code (currently only VND)',
    enum: ['VND'],
    example: 'VND',
  })
  @IsOptional()
  @IsEnum(['VND'])
  vnp_CurrCode?: string;

  @ApiPropertyOptional({
    description: 'Gateway language',
    enum: ['vn', 'en'],
    example: 'vn',
  })
  @IsOptional()
  @IsEnum(['vn', 'en'])
  vnp_Locale?: string;

  @ApiPropertyOptional({
    description: 'Order/product code',
    example: 'other',
  })
  @IsOptional()
  @IsString()
  vnp_OrderType?: string;

  @ApiPropertyOptional({
    description: 'Optional bank code',
    example: 'NCB',
  })
  @IsOptional()
  @IsString()
  vnp_BankCode?: string;
}

export class BuildPaymentUrlOptionsDto {
  @ApiPropertyOptional({
    description: 'Include vnp_SecureHash in returned payment URL',
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

export class CreateVNPayPaymentUrlDto {
  @ApiProperty({
    description: 'BuildPaymentUrl payload for VNPay',
    type: BuildPaymentUrlDto,
  })
  @ValidateNested()
  @Type(() => BuildPaymentUrlDto)
  data: BuildPaymentUrlDto;

  @ApiPropertyOptional({
    description: 'Optional BuildPaymentUrlOptions for VNPay',
    type: BuildPaymentUrlOptionsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BuildPaymentUrlOptionsDto)
  options?: BuildPaymentUrlOptionsDto;
}
