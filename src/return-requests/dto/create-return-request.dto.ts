import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VietnamBankName } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateReturnRequestDto {
  @ApiProperty({ example: 1033 })
  @IsNotEmpty()
  @Type(() => BigInt)
  userId: bigint;

  @ApiProperty({ example: 1001 })
  @IsNotEmpty()
  @Type(() => BigInt)
  orderId: bigint;

  @ApiProperty({ example: 'Item is damaged' })
  @IsNotEmpty()
  @Type(() => String)
  description: string;

  @ApiPropertyOptional({
    example:
      'AGRIBANK | BIDV | VIETCOMBANK | VIETINBANK | MBBANK | ACB | TECHCOMBANK | VPBANK | TPBANK | SACOMBANK | HDBANK | VIB | OCB | SHB | SEABANK | EXIMBANK | MSB | NAMABANK | BACABANK | PVCOMBANK | ABBANK | LIENVIETPOSTBANK | KIENLONGBANK | VIETABANK | SAIGONBANK',
  })
  @IsOptional()
  @IsEnum(VietnamBankName)
  bankName?: VietnamBankName;

  @ApiPropertyOptional({ example: '0123456789', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankAccountNumber?: string;

  @ApiPropertyOptional({ example: 'NGUYEN VAN A', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankAccountName?: string;
}
