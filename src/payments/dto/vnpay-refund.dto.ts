import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RefundDataDto {
  @ApiProperty({
    description: 'Merchant terminal code',
    example: 'L62FDD2R',
  })
  @IsString()
  vnp_TmnCode: string;

  @ApiProperty({
    description: 'Request ID for the refund (unique per request)',
    example: '123456',
  })
  @IsString()
  vnp_RequestId: string;

  @ApiProperty({
    description: 'Original transaction reference ID to refund',
    example: 'ORDER_12345',
  })
  @IsString()
  vnp_TxnRef: string;

  @ApiProperty({
    description: 'Amount to refund (in VND, will be divided by 100)',
    example: 150000,
    type: Number,
  })
  @IsNumber()
  vnp_Amount: number;

  @ApiProperty({
    description: 'Original transaction date format yyyyMMddHHmmss',
    example: 20260305120000,
    type: Number,
  })
  @IsNumber()
  vnp_TransactionDate: number;

  @ApiProperty({
    description: 'IP address of the refund request',
    example: '192.168.1.1',
  })
  @IsString()
  vnp_IpAddr: string;

  @ApiProperty({
    description: 'Transaction type (typically "refund")',
    example: 'refund',
  })
  @IsString()
  vnp_TransactionType: string;

  @ApiProperty({
    description: 'Creation date format yyyyMMddHHmmss',
    example: 20260305120000,
    type: Number,
  })
  @IsNumber()
  vnp_CreateDate: number;

  @ApiProperty({
    description: 'Name of the person creating the refund request',
    example: 'Admin User',
  })
  @IsString()
  vnp_CreateBy: string;

  @ApiPropertyOptional({
    description:
      'Refund amount (in VND, optional - if not set, refunds full amount)',
    example: 150000,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  vnp_RefundAmount?: number;

  @ApiPropertyOptional({
    description: 'Reason for refund',
    example: 'Customer request',
  })
  @IsOptional()
  @IsString()
  vnp_OrderInfo?: string;
}

export class RefundOptionsDto {
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

export class VnpayRefundDto {
  @ApiProperty({
    description: 'Refund request data for VNPAY',
    type: RefundDataDto,
  })
  @ValidateNested()
  @Type(() => RefundDataDto)
  data: RefundDataDto;

  @ApiPropertyOptional({
    description: 'Optional refund options',
    type: RefundOptionsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RefundOptionsDto)
  options?: RefundOptionsDto;
}
