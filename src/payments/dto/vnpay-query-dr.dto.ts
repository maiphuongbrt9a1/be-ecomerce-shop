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

export class QueryDrDataDto {
  @ApiProperty({
    description: 'Merchant terminal code',
    example: 'L62FDD2R',
  })
  @IsString()
  vnp_TmnCode: string;

  @ApiProperty({
    description: 'Request ID for the query (unique per request)',
    example: '120000',
  })
  @IsString()
  vnp_RequestId: string;

  @ApiProperty({
    description: 'Transaction reference ID to query',
    example: 'ORDER_12345',
  })
  @IsString()
  vnp_TxnRef: string;

  @ApiProperty({
    description: 'Transaction date format yyyyMMddHHmmss',
    example: 20260305120000,
    type: Number,
  })
  @IsNumber()
  vnp_TransactionDate: number;

  @ApiProperty({
    description: 'Transaction number at VNPAY system',
    example: 123456,
    type: Number,
  })
  @IsNumber()
  vnp_TransactionNo: number;

  @ApiProperty({
    description: 'IP address of the request',
    example: '192.168.1.1',
  })
  @IsString()
  vnp_IpAddr: string;

  @ApiPropertyOptional({
    description: 'Order information/description',
    example: 'Thanh toan don hang 12345',
  })
  @IsOptional()
  @IsString()
  vnp_OrderInfo?: string;

  @ApiPropertyOptional({
    description: 'Create date format yyyyMMddHHmmss (for compatibility)',
    example: 20260305120000,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  vnp_CreateDate?: number;

  @ApiPropertyOptional({
    description: 'Name of the person creating the query',
    example: 'Admin User',
  })
  @IsOptional()
  @IsString()
  vnp_CreateBy?: string;
}

export class QueryDrOptionsDto {
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

export class VnpayQueryDrDto {
  @ApiProperty({
    description: 'Query dispute record data for VNPAY',
    type: QueryDrDataDto,
  })
  @ValidateNested()
  @Type(() => QueryDrDataDto)
  data: QueryDrDataDto;

  @ApiPropertyOptional({
    description: 'Optional query options',
    type: QueryDrOptionsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => QueryDrOptionsDto)
  options?: QueryDrOptionsDto;
}
