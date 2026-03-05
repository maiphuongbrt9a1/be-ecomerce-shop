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
  // ============ REQUIRED FIELDS ============
  @ApiProperty({
    description: 'Merchant TMN code - 8 alphanumeric characters',
    example: 'L62FDD2R',
  })
  @IsString()
  vnp_TmnCode: string;

  @ApiProperty({
    description:
      'Payment amount - Numeric string, VNPAY returns amount multiplied by 100',
    example: '15000000',
  })
  @IsString()
  vnp_Amount: string;

  @ApiProperty({
    description:
      'Bank code used for payment - 3-20 alphanumeric characters. Example: NCB',
    example: 'NCB',
  })
  @IsString()
  vnp_BankCode: string;

  @ApiProperty({
    description:
      'Payment description from original transaction - Vietnamese without accents',
    example: 'Thanh toan don hang 12345',
  })
  @IsString()
  vnp_OrderInfo: string;

  @ApiProperty({
    description:
      'Transaction code recorded in VNPAY system - 1-15 numeric characters',
    example: '20170829153052',
  })
  @IsString()
  vnp_TransactionNo: string;

  @ApiProperty({
    description: 'Response code from VNPAY (00 = success)',
    example: '00',
  })
  @IsString()
  vnp_ResponseCode: string;

  @ApiProperty({
    description:
      'Transaction status at VNPAY (00 = successful, others = failed)',
    example: '00',
  })
  @IsString()
  vnp_TransactionStatus: string;

  @ApiProperty({
    description:
      'Merchant transaction reference from original request - 1-100 alphanumeric characters',
    example: 'ORDER_12345',
  })
  @IsString()
  vnp_TxnRef: string;

  @ApiProperty({
    description:
      'Secure hash from VNPAY callback - 32-256 alphanumeric characters for checksum verification',
    example: '5CC2F6B77D96B5D7F3B5E4C3D2A1E9F8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D3',
  })
  @IsString()
  vnp_SecureHash: string;

  // ============ OPTIONAL FIELDS ============
  @ApiPropertyOptional({
    description: 'Transaction code at bank - 1-255 alphanumeric characters',
    example: 'NCB20170829152730',
  })
  @IsOptional()
  @IsString()
  vnp_BankTranNo?: string;

  @ApiPropertyOptional({
    description: 'Type of account/card used: ATM, QRCODE',
    example: 'ATM',
  })
  @IsOptional()
  @IsString()
  vnp_CardType?: string;

  @ApiPropertyOptional({
    description:
      'Payment date - Format: yyyyMMddHHmmss (14 numeric characters)',
    example: '20170829152730',
  })
  @IsOptional()
  @IsString()
  vnp_PayDate?: string;

  @ApiPropertyOptional({
    description: 'Secure hash type algorithm',
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
