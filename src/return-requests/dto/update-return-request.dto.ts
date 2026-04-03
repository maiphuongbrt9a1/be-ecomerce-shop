import { ApiProperty, PartialType } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CreateReturnRequestDto } from './create-return-request.dto';

export class UpdateReturnRequestDto {
  @ApiProperty({ example: 1033 })
  @IsNotEmpty()
  @Type(() => BigInt)
  processByStaffId: bigint;

  @ApiProperty({
    example:
      RequestStatus.APPROVED ||
      RequestStatus.REJECTED ||
      RequestStatus.IN_PROGRESS,
  })
  @IsNotEmpty()
  @IsEnum(RequestStatus)
  status: RequestStatus;
}

export class UserUpdateReturnRequestDto extends PartialType(
  CreateReturnRequestDto,
) {}
