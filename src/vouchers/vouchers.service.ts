import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { SearchVoucherDto } from './dto/search-voucher.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Vouchers, DiscountType } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import {
  VoucherWithAllAppliedCategoriesDetailInformation,
  VoucherWithAllAppliedProductsDetailInformation,
  VoucherWithAllAppliedProductVariantsDetailInformation,
} from '@/helpers/types/types';
import { NotificationService } from '@/notification/notification.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class VouchersService {
  private readonly logger = new Logger(VouchersService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  private async sendShopNotificationSafely(
    senderId: bigint | number,
    title: string,
    content: string,
  ): Promise<void> {
    try {
      await this.notificationService.sendNotificationToAllUsers(
        Number(senderId),
        title,
        content,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send shop notification from sender ${senderId}`,
        error,
      );
    }
  }

  /**
   * Scans and disables vouchers that are no longer valid.
   *
   * Runs every 6 minutes and disables vouchers that are either past validTo
   * or have timesUsed greater than or equal to usageLimit.
   *
   * @remarks
   * - The cron schedule runs every 6 minutes at second 0.
   * - The job only touches vouchers that are currently active.
   * - isOverUsageLimit is set to true only when the usage limit is exceeded.
   * - Date-expired vouchers are still disabled, but they do not get marked as over-usage.
   */
  @Cron('0 */6 * * * *')
  async handleCancelExpiredVouchers() {
    this.logger.log('Scanning for expired vouchers...');

    try {
      await this.prismaService.$transaction(async (tx) => {
        // get all voucher is active
        // and check if they are expired by validTo date or usage limit
        const currentDate = new Date();
        const activeVouchers = await tx.vouchers.findMany({
          where: { isActive: true },
        });

        // get all vouchers that are expired
        const expiredVouchers = activeVouchers.filter((voucher) => {
          // Case 1: Voucher has a validTo date and it's in the past
          const isDateExpired = voucher.validTo < currentDate;

          // case 2: Voucher has a usage limit and it has been exceeded
          const isUsageLimitExceeded =
            voucher.usageLimit !== null &&
            voucher.timesUsed >= voucher.usageLimit; // trường hợp đã dùng quá lượt dùng cho phép.

          return isDateExpired || isUsageLimitExceeded;
        });

        if (expiredVouchers.length === 0) {
          this.logger.log('No expired vouchers found.');
          return;
        }

        this.logger.log(
          `Found ${expiredVouchers.length} expired vouchers. Cancelling these vouchers...`,
        );

        const expiredVoucherIds = expiredVouchers.map((voucher) => voucher.id);

        // Disable each expired voucher. Only usage-limit expiration should set isOverUsageLimit.
        for (const voucherId of expiredVoucherIds) {
          try {
            this.logger.log('Disabling voucher with ID: ' + voucherId);
            const expiredVoucher = expiredVouchers.find(
              (voucher) => voucher.id === voucherId,
            );
            await tx.vouchers.update({
              where: { id: voucherId },
              data: {
                isActive: false,
                isOverUsageLimit:
                  expiredVoucher !== undefined &&
                  expiredVoucher.usageLimit !== null &&
                  expiredVoucher.timesUsed >= expiredVoucher.usageLimit,
              },
            });
            this.logger.log(
              'Successfully disabled voucher with ID: ' + voucherId,
            );
          } catch (error) {
            this.logger.error(
              'Error occurred while disabling voucher with ID: ' + voucherId,
              error,
            );
          }
        }
      });

      this.logger.log(
        'Successfully completed scanning and cancelling expired vouchers.',
      );
    } catch (error) {
      this.logger.error(
        'Error occurred while running cron job to cancel expired vouchers:',
        error,
      );
    }
  }

  /**
   * Creates a new voucher with discount and application settings.
   *
   * This method performs the following operations:
   * 1. Creates a new voucher in the database
   * 2. Logs the creation operation
   *
   * @param {CreateVoucherDto} createVoucherDto - The data transfer object containing voucher information:
   *   - Discount type (percentage/fixed amount), discount value
   *   - Application scope (categories, products, variants)
   *   - Validity dates, usage limits
   *
   * @returns {Promise<Vouchers>} The created voucher with all details
   *
   * @throws {BadRequestException} If voucher creation fails
   *
   * @remarks
   * - Vouchers can be applied to categories, products, or specific variants
   * - Supports both percentage and fixed amount discounts
   */
  async create(createVoucherDto: CreateVoucherDto): Promise<Vouchers> {
    try {
      const result = await this.prismaService.vouchers.create({
        data: { ...createVoucherDto },
      });

      await this.sendShopNotificationSafely(
        createVoucherDto.createdBy,
        'New voucher is available',
        `A new voucher ${result.code} is now available. Check details and validity in the voucher section.`,
      );

      this.logger.log('Voucher created successfully', result.id);
      return result;
    } catch (error) {
      this.logger.error('Error creating voucher', error);
      throw new BadRequestException('Failed to create voucher');
    }
  }

  /**
   * Retrieves a paginated list of all vouchers.
   *
   * This method performs the following operations:
   * 1. Fetches vouchers from the database with pagination
   * 2. Orders results by voucher ID
   * 3. Logs retrieval operation
   *
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of vouchers to retrieve per page
   *
   * @returns {Promise<Vouchers[] | []>} Array of vouchers with all details
   *   Returns empty array if no vouchers found
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by voucher ID in ascending order
   * - Empty array returned for consistency
   */
  async findAll(page: number, perPage: number): Promise<Vouchers[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Vouchers, Prisma.VouchersFindManyArgs>(
        this.prismaService.vouchers,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Vouchers retrieved successfully');
      return result.data;
    } catch (error) {
      this.logger.error('Error retrieving vouchers', error);
      throw new BadRequestException('Failed to retrieve vouchers');
    }
  }

  /**
   * Search and filter vouchers with optional criteria.
   */
  async search(
    dto: SearchVoucherDto,
    page: number,
    perPage: number,
  ): Promise<Vouchers[] | []> {
    try {
      const where: Prisma.VouchersWhereInput = {};

      if (dto.code) {
        where.code = { contains: dto.code, mode: 'insensitive' };
      }
      if (dto.discountType) {
        where.discountType = dto.discountType as DiscountType;
      }
      if (dto.isActive !== undefined && dto.isActive !== null) {
        where.isActive = dto.isActive;
      }

      const paginate = createPaginator({ perPage });
      const result = await paginate<Vouchers, Prisma.VouchersFindManyArgs>(
        this.prismaService.vouchers,
        { where, orderBy: { id: 'asc' } },
        { page },
      );

      this.logger.log(`Voucher search returned ${result.data.length} results`);
      return result.data;
    } catch (error) {
      this.logger.error('Error searching vouchers', error);
      throw new BadRequestException('Failed to search vouchers');
    }
  }

  /**
   * Retrieves a single voucher by ID.
   *
   * This method performs the following operations:
   * 1. Queries the database for the voucher by ID
   * 2. Logs retrieval operation
   *
   * @param {number} id - The unique identifier of the voucher to retrieve
   *
   * @returns {Promise<Vouchers | null>} The voucher with all details
   *   Returns null if voucher not found
   *
   * @throws {NotFoundException} If voucher is not found
   * @throws {BadRequestException} If data fetching fails
   *
   * @remarks
   * - Useful for fetching voucher details for editing or display
   */
  async findOne(id: number): Promise<Vouchers | null> {
    try {
      const result = await this.prismaService.vouchers.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Voucher not found!');
      }

      this.logger.log('Voucher retrieved successfully', id);
      return result;
    } catch (error) {
      this.logger.error('Error retrieving voucher', error);
      throw new BadRequestException('Failed to retrieve voucher');
    }
  }

  /**
   * Updates an existing voucher with new information.
   *
   * This method performs the following operations:
   * 1. Updates the voucher in the database
   * 2. Logs the update operation
   *
   * @param {number} id - The unique identifier of the voucher to update
   * @param {UpdateVoucherDto} updateVoucherDto - The data transfer object containing voucher updates:
   *   - May include discount value, dates, usage limits, or other properties
   *
   * @returns {Promise<Vouchers>} The updated voucher with new values
   *
   * @throws {BadRequestException} If voucher update fails
   *
   * @remarks
   * - Allows updating discount settings and validity periods
   */
  async update(
    id: number,
    updateVoucherDto: UpdateVoucherDto,
  ): Promise<Vouchers> {
    try {
      const existingVoucher = await this.prismaService.vouchers.findUnique({
        where: { id: id },
      });

      if (!existingVoucher) {
        throw new NotFoundException('Voucher not found!');
      }

      const result = await this.prismaService.vouchers.update({
        where: { id: id },
        data: { ...updateVoucherDto },
      });

      await this.sendShopNotificationSafely(
        existingVoucher.createdBy,
        'Voucher has been updated',
        `Voucher ${result.code} has updated settings. Please review its current discount and validity period.`,
      );

      this.logger.log('Voucher updated successfully', id);
      return result;
    } catch (error) {
      this.logger.error('Error updating voucher', error);
      throw new BadRequestException('Failed to update voucher');
    }
  }

  /**
   * Deletes a voucher from the database.
   *
   * This method performs the following operations:
   * 1. Removes the voucher from the database
   * 2. Logs the deletion operation
   *
   * @param {number} id - The unique identifier of the voucher to delete
   *
   * @returns {Promise<Vouchers>} The deleted voucher record
   *
   * @throws {BadRequestException} If deletion fails or voucher not found
   *
   * @remarks
   * - Verify before deletion as this action cannot be easily reversed
   * - Use with caution in production environments
   */
  async remove(id: number): Promise<Vouchers> {
    try {
      const voucher = await this.prismaService.vouchers.findUnique({
        where: { id: id },
      });

      if (!voucher) {
        throw new NotFoundException('Voucher not found!');
      }

      this.logger.log('Voucher deleted successfully', id);
      const deletedVoucher = await this.prismaService.vouchers.delete({
        where: { id: id },
      });

      await this.sendShopNotificationSafely(
        voucher.createdBy,
        'Voucher has ended',
        `Voucher ${deletedVoucher.code} is no longer available.`,
      );

      return deletedVoucher;
    } catch (error) {
      this.logger.error('Error deleting voucher', error);
      throw new BadRequestException('Failed to delete voucher');
    }
  }

  /**
   * Retrieves paginated categories that have a specific voucher applied.
   *
   * This method performs the following operations:
   * 1. Fetches the voucher with all applied categories
   * 2. Supports pagination for large category lists
   * 3. Logs retrieval operation
   *
   * @param {number} id - The unique identifier of the voucher
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of categories to retrieve per page
   *
   * @returns {Promise<VoucherWithAllAppliedCategoriesDetailInformation[] | []>} Array of vouchers with applied categories
   *   Returns empty array if no categories found
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by voucher ID in ascending order
   * - Returns voucher data including all applied categories
   * - Empty array returned for consistency
   */
  async getAllCategoriesAreAppliedThisVoucher(
    id: number,
    page: number,
    perPage: number,
  ): Promise<VoucherWithAllAppliedCategoriesDetailInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        VoucherWithAllAppliedCategoriesDetailInformation,
        Prisma.VouchersFindManyArgs
      >(
        this.prismaService.vouchers,
        {
          include: {
            voucherForCategory: true,
          },
          where: { id: id },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      this.logger.log(
        'Categories applied to voucher retrieved successfully',
        id,
      );
      return result.data;
    } catch (error) {
      this.logger.error(
        'Error retrieving categories applied to voucher',
        error,
      );
      throw new BadRequestException(
        'Failed to retrieve categories applied to voucher',
      );
    }
  }

  /**
   * Retrieves paginated products that have a specific voucher applied.
   *
   * This method performs the following operations:
   * 1. Fetches the voucher with all applied products
   * 2. Supports pagination for large product lists
   * 3. Logs retrieval operation
   *
   * @param {number} id - The unique identifier of the voucher
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of products to retrieve per page
   *
   * @returns {Promise<VoucherWithAllAppliedProductsDetailInformation[] | []>} Array of vouchers with applied products
   *   Returns empty array if no products found
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by voucher ID in ascending order
   * - Returns voucher data including all applied products
   * - Empty array returned for consistency
   */
  async getAllProductsAreAppliedThisVoucher(
    id: number,
    page: number,
    perPage: number,
  ): Promise<VoucherWithAllAppliedProductsDetailInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        VoucherWithAllAppliedProductsDetailInformation,
        Prisma.VouchersFindManyArgs
      >(
        this.prismaService.vouchers,
        {
          include: {
            voucherForProduct: true,
          },
          where: { id: id },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      this.logger.log('Products applied to voucher retrieved successfully', id);
      return result.data;
    } catch (error) {
      this.logger.error('Error retrieving products applied to voucher', error);
      throw new BadRequestException(
        'Failed to retrieve products applied to voucher',
      );
    }
  }

  /**
   * Retrieves paginated product variants that have a specific voucher applied.
   *
   * This method performs the following operations:
   * 1. Fetches the voucher with all applied product variants
   * 2. Supports pagination for large variant lists
   * 3. Logs retrieval operation
   *
   * @param {number} id - The unique identifier of the voucher
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of variants to retrieve per page
   *
   * @returns {Promise<VoucherWithAllAppliedProductVariantsDetailInformation[] | []>} Array of vouchers with applied variants
   *   Returns empty array if no variants found
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by voucher ID in ascending order
   * - Returns voucher data including all applied product variants
   * - Empty array returned for consistency
   * - Useful for special variant-specific discounts
   */
  async getAllProductVariantsAreAppliedThisVoucher(
    id: number,
    page: number,
    perPage: number,
  ): Promise<VoucherWithAllAppliedProductVariantsDetailInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        VoucherWithAllAppliedProductVariantsDetailInformation,
        Prisma.VouchersFindManyArgs
      >(
        this.prismaService.vouchers,
        {
          include: {
            voucherForSpecialProductVariant: true,
          },
          where: { id: id },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      this.logger.log(
        'Product variants applied to voucher retrieved successfully',
        id,
      );
      return result.data;
    } catch (error) {
      this.logger.log(
        'Error retrieving product variants applied to voucher',
        error,
      );
      throw new BadRequestException(
        'Failed to retrieve product variants applied to voucher',
      );
    }
  }
}
