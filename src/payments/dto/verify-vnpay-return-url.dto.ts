import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReturnQueryFromVNPayDto {
  @ApiProperty({
    description: 'Payment amount',
    example: 150000,
    type: 'number',
  })
  vnp_Amount: number | string;

  @ApiProperty({
    description: 'Payment description from original transaction',
    example: 'Thanh toan don hang 12345',
  })
  @IsString()
  vnp_OrderInfo: string;

  @ApiProperty({
    description: 'Merchant transaction reference from original request',
    example: 'ORDER_12345',
  })
  @IsString()
  vnp_TxnRef: string;

  @ApiProperty({
    description: 'Response code from VNPAY (00 = success, other = failed)',
    example: '00',
    type: 'string',
  })
  vnp_ResponseCode: number | string;

  @ApiPropertyOptional({
    description: 'Merchant TMN code',
    example: 'TMN_CODE',
  })
  @IsOptional()
  @IsString()
  vnp_TmnCode?: string;

  @ApiPropertyOptional({
    description: 'Bank code used for payment',
    example: 'NCB',
  })
  @IsOptional()
  @IsString()
  vnp_BankCode?: string;

  @ApiPropertyOptional({
    description: 'Transaction code at bank',
    example: 'NCB20170829152730',
  })
  @IsOptional()
  @IsString()
  vnp_BankTranNo?: string;

  @ApiPropertyOptional({
    description: 'Type of customer account/card used: ATM, QRCODE',
    example: 'ATM',
  })
  @IsOptional()
  @IsString()
  vnp_CardType?: string;

  @ApiPropertyOptional({
    example: '20170829152730',
    type: 'string',
  })
  @IsOptional()
  vnp_PayDate?: number | string;

  @ApiPropertyOptional({
    description: 'Transaction code recorded in VNPAY system',
    example: '20170829153052',
    type: 'string',
  })
  @IsOptional()
  vnp_TransactionNo?: number | string;

  @ApiPropertyOptional({
    description: 'Secure hash from VNPAY callback',
    example: 'hash_string_here',
  })
  @IsOptional()
  @IsString()
  vnp_SecureHash?: string;

  @ApiPropertyOptional({
    description: 'Secure hash type',
    example: 'HmacSHA512',
  })
  @IsOptional()
  @IsString()
  vnp_SecureHashType?: string;
}

export class VerifyReturnUrlOptionsDto {
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

export class VerifyVNPayReturnUrlDto {
  @ApiProperty({
    description: 'Return query data from VNPAY callback',
    type: ReturnQueryFromVNPayDto,
  })
  @ValidateNested()
  @Type(() => ReturnQueryFromVNPayDto)
  data: ReturnQueryFromVNPayDto;

  @ApiPropertyOptional({
    description: 'Optional verification options',
    type: VerifyReturnUrlOptionsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => VerifyReturnUrlOptionsDto)
  options?: VerifyReturnUrlOptionsDto;
}
