import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserVoucherDto } from './dto/create-user-voucher.dto';
import { UpdateUserVoucherDto } from './dto/update-user-voucher.dto';
import { Prisma, UserVouchers } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { createPaginator } from 'prisma-pagination';
import { UserVoucherDetailInformation } from '@/helpers/types/types';

@Injectable()
export class UserVouchersService {
  private readonly logger = new Logger(UserVouchersService.name);
  constructor(private readonly prismaService: PrismaService) {}
  /**
   * Creates a new user voucher association (user saves a voucher).
   *
   * This method performs the following operations:
   * 1. Creates user voucher record in database
   * 2. Validates creation success
   * 3. Retrieves created record with voucher details
   * 4. Logs successful creation
   * 5. Returns user voucher with complete information
   *
   * @param {CreateUserVoucherDto} createUserVoucherDto - The user voucher data containing:
   *   - userId (user ID)
   *   - voucherId (voucher ID)
   *   - voucherStatus (SAVED, USED, EXPIRED)
   *   - savedAt timestamp
   *
   * @returns {Promise<UserVoucherDetailInformation>} The created user voucher with details:
   *   - User voucher ID, user ID, voucher ID
   *   - Voucher status
   *   - Complete voucher information (code, discount, validity)
   *   - Created/saved timestamps
   *
   * @throws {BadRequestException} If user voucher creation fails
   * @throws {NotFoundException} If created record cannot be retrieved
   *
   * @remarks
   * - Links a voucher to a user's account
   * - Status typically starts as SAVED
   * - Used when user saves a voucher for later use
   * - Includes full voucher details in response
   */
  async create(
    createUserVoucherDto: CreateUserVoucherDto,
  ): Promise<UserVoucherDetailInformation> {
    try {
      const result = await this.prismaService.userVouchers.create({
        data: { ...createUserVoucherDto },
      });

      if (!result) {
        throw new BadRequestException('User voucher creation failed!');
      }

      const returnResult = await this.prismaService.userVouchers.findUnique({
        where: { id: result.id },
        include: {
          voucher: true,
        },
      });

      if (!returnResult) {
        throw new NotFoundException('Created user voucher not found!');
      }

      this.logger.log('User voucher created successfully', returnResult.id);
      return returnResult;
    } catch (error) {
      this.logger.log('Error creating user voucher', error);
      throw new BadRequestException('Failed to create user voucher');
    }
  }

  /**
   * Retrieves paginated list of all user vouchers with voucher details.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries all user vouchers from database
   * 3. Includes complete voucher information
   * 4. Sorts results by user voucher ID ascending
   * 5. Returns paginated user voucher data
   * 6. Logs successful retrieval
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of user vouchers per page
   *
   * @returns {Promise<UserVoucherDetailInformation[] | []>} Array of user vouchers:
   *   - User voucher ID, user ID, voucher ID
   *   - Voucher status (SAVED, USED, EXPIRED)
   *   - Complete voucher details (code, discount, validity period)
   *   - Usage restrictions and conditions
   *   - Created/saved/used timestamps
   *
   * @throws {BadRequestException} If user voucher retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by user voucher ID in ascending order
   * - Returns empty array if no user vouchers exist
   * - Used for admin voucher usage management
   */
  async findAll(
    page: number,
    perPage: number,
  ): Promise<UserVoucherDetailInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        UserVoucherDetailInformation,
        Prisma.UserVouchersFindManyArgs
      >(
        this.prismaService.userVouchers,
        {
          include: {
            voucher: true,
          },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      this.logger.log('User vouchers retrieved successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving user vouchers', error);
      throw new BadRequestException('Failed to retrieve user vouchers');
    }
  }

  /**
   * Retrieves a single user voucher by ID with complete voucher details.
   *
   * This method performs the following operations:
   * 1. Queries user voucher by ID
   * 2. Includes complete voucher information
   * 3. Validates user voucher exists
   * 4. Logs successful retrieval
   * 5. Returns user voucher with details
   *
   * @param {number} id - The user voucher ID to retrieve
   *
   * @returns {Promise<UserVoucherDetailInformation | null>} The user voucher with details:
   *   - User voucher ID, user ID, voucher ID
   *   - Voucher status (SAVED, USED, EXPIRED)
   *   - Complete voucher information (code, discount, validity)
   *   - Usage restrictions and conditions
   *   - Created/saved/used timestamps
   *
   * @throws {NotFoundException} If user voucher not found
   * @throws {BadRequestException} If user voucher retrieval fails
   *
   * @remarks
   * - Returns null if user voucher doesn't exist
   * - Includes full voucher details in response
   * - Used for viewing specific user voucher details
   * - Helps verify voucher availability and status
   */
  async findOne(id: number): Promise<UserVoucherDetailInformation | null> {
    try {
      const result = await this.prismaService.userVouchers.findFirst({
        include: {
          voucher: true,
        },
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('User voucher not found!');
      }

      this.logger.log('User voucher retrieved successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving user voucher', error);
      throw new BadRequestException('Failed to retrieve user voucher');
    }
  }

  /**
   * Updates an existing user voucher (typically status changes).
   *
   * This method performs the following operations:
   * 1. Updates user voucher in database
   * 2. Validates update success
   * 3. Retrieves updated record with voucher details
   * 4. Logs successful update
   * 5. Returns updated user voucher with complete information
   *
   * @param {number} id - The user voucher ID to update
   * @param {UpdateUserVoucherDto} updateUserVoucherDto - The update data containing:
   *   - voucherStatus (SAVED → USED or EXPIRED)
   *   - usedAt timestamp (when status changes to USED)
   *
   * @returns {Promise<UserVoucherDetailInformation>} The updated user voucher with details:
   *   - User voucher ID, user ID, voucher ID
   *   - Updated voucher status
   *   - Complete voucher information
   *   - Updated timestamps
   *
   * @throws {BadRequestException} If user voucher update fails
   * @throws {NotFoundException} If updated record cannot be retrieved
   *
   * @remarks
   * - Primarily used to change voucher status (SAVED → USED)
   * - Updates timestamp when voucher is used
   * - Includes full voucher details in response
   * - Used during checkout when voucher is applied
   */
  async update(
    id: number,
    updateUserVoucherDto: UpdateUserVoucherDto,
  ): Promise<UserVoucherDetailInformation> {
    try {
      const result = await this.prismaService.userVouchers.update({
        where: { id: id },
        data: { ...updateUserVoucherDto },
      });

      if (!result) {
        throw new BadRequestException('User voucher update failed!');
      }

      const returnResult = await this.prismaService.userVouchers.findUnique({
        where: { id: result.id },
        include: {
          voucher: true,
        },
      });

      if (!returnResult) {
        throw new NotFoundException('Updated user voucher not found!');
      }

      this.logger.log('User voucher updated successfully', id);
      return returnResult;
    } catch (error) {
      this.logger.log('Error updating user voucher', error);
      throw new BadRequestException('Failed to update user voucher');
    }
  }

  /**
   * Deletes a user voucher association (removes saved voucher from user).
   *
   * This method performs the following operations:
   * 1. Logs deletion operation
   * 2. Deletes user voucher from database
   * 3. Returns deleted user voucher
   *
   * @param {number} id - The user voucher ID to delete
   *
   * @returns {Promise<UserVouchers>} The deleted user voucher with all details
   *
   * @throws {BadRequestException} If user voucher deletion fails
   * @throws {NotFoundException} If user voucher not found
   *
   * @remarks
   * - This operation is irreversible
   * - Does not delete the voucher itself, only user's association
   * - User can save the voucher again later
   * - Used when user removes a saved voucher from their account
   */
  async remove(id: number): Promise<UserVouchers> {
    try {
      this.logger.log('User voucher deleted successfully', id);

      return await this.prismaService.userVouchers.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log('Error deleting user voucher', error);
      throw new BadRequestException('Failed to delete user voucher');
    }
  }
}
