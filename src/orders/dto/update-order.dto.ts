import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class UpdateOrderDto {
  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  processByStaffId: bigint;

  @ApiProperty({
    example: 1,
    description: 'please pass id that is a result of pickShiftOnGHNSystem api',
  })
  @IsNotEmpty()
  ghnPickShiftId: bigint;

  @ApiProperty({
    example: 'Ca lấy 12-03-2021 (12h00 - 18h00)',
    description:
      'please pass title that is a result of pickShiftOnGHNSystem api',
  })
  @IsNotEmpty()
  @IsString()
  ghnTitle: string;

  @ApiProperty({
    example: 43200,
    description:
      'please pass from_time that is a result of pickShiftOnGHNSystem api',
  })
  @IsNotEmpty()
  ghnFromTime: bigint;

  @ApiProperty({
    example: 64800,
    description:
      'please pass to_time that is a result of pickShiftOnGHNSystem api',
  })
  @IsNotEmpty()
  ghnToTime: bigint;
}

export class UpdateOrderFromWaitingForPickupToShippedDto {
  @ApiProperty({ example: 851 })
  @IsNotEmpty()
  processByStaffId: bigint;
}
