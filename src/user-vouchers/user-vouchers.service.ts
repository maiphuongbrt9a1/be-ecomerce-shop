import { Injectable } from '@nestjs/common';
import { CreateUserVoucherDto } from './dto/create-user-voucher.dto';
import { UpdateUserVoucherDto } from './dto/update-user-voucher.dto';

@Injectable()
export class UserVouchersService {
  create(createUserVoucherDto: CreateUserVoucherDto) {
    return 'This action adds a new userVoucher';
  }

  findAll() {
    return `This action returns all userVouchers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userVoucher`;
  }

  update(id: number, updateUserVoucherDto: UpdateUserVoucherDto) {
    return `This action updates a #${id} userVoucher`;
  }

  remove(id: number) {
    return `This action removes a #${id} userVoucher`;
  }
}
