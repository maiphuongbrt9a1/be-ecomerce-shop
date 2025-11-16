import { Injectable } from '@nestjs/common';
import { CreateSizeProfileDto } from './dto/create-size-profile.dto';
import { UpdateSizeProfileDto } from './dto/update-size-profile.dto';

@Injectable()
export class SizeProfilesService {
  create(createSizeProfileDto: CreateSizeProfileDto) {
    return 'This action adds a new sizeProfile';
  }

  findAll() {
    return `This action returns all sizeProfiles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sizeProfile`;
  }

  update(id: number, updateSizeProfileDto: UpdateSizeProfileDto) {
    return `This action updates a #${id} sizeProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} sizeProfile`;
  }
}
