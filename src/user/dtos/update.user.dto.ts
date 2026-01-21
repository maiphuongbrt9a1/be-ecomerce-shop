import { OmitType } from '@nestjs/swagger';
import { CreateUserDto, CreateUserWithFileDto } from './create.user.dto';
import { TransformEmptyToUndefined } from '@/decorator/customize';

export class UpdateUserDto extends OmitType(CreateUserDto, [
  'createdAt',
  'codeActive',
  'codeActiveExpire',
  'isActive',
] as const) {
  @TransformEmptyToUndefined()
  firstName: string;

  @TransformEmptyToUndefined()
  lastName: string;

  @TransformEmptyToUndefined()
  gender: any;

  @TransformEmptyToUndefined()
  email: string;

  @TransformEmptyToUndefined()
  phone: string;

  @TransformEmptyToUndefined()
  password: string;

  @TransformEmptyToUndefined()
  username: string;

  @TransformEmptyToUndefined()
  role: any;

  @TransformEmptyToUndefined()
  staffCode: string;

  @TransformEmptyToUndefined()
  loyaltyCard: string;

  @TransformEmptyToUndefined()
  shopOfficeId: bigint;

  @TransformEmptyToUndefined()
  point: number;
}

export class UpdateUserWithFileDto extends OmitType(CreateUserWithFileDto, [
  'createdAt',
  'codeActive',
  'codeActiveExpire',
  'isActive',
] as const) {
  @TransformEmptyToUndefined()
  firstName: string;

  @TransformEmptyToUndefined()
  lastName: string;

  @TransformEmptyToUndefined()
  gender: any;

  @TransformEmptyToUndefined()
  email: string;

  @TransformEmptyToUndefined()
  phone: string;

  @TransformEmptyToUndefined()
  password: string;

  @TransformEmptyToUndefined()
  username: string;

  @TransformEmptyToUndefined()
  role: any;

  @TransformEmptyToUndefined()
  staffCode: string;

  @TransformEmptyToUndefined()
  loyaltyCard: string;

  @TransformEmptyToUndefined()
  shopOfficeId: bigint;

  @TransformEmptyToUndefined()
  point: number;

  @TransformEmptyToUndefined()
  file: Express.Multer.File;
}
