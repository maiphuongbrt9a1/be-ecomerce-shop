import { PartialType } from '@nestjs/swagger';
import { CreateUserVoucherDto } from './create-user-voucher.dto';

export class UpdateUserVoucherDto extends PartialType(CreateUserVoucherDto) {}
