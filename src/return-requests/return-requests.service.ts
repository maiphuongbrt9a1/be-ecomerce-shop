import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import { UpdateReturnRequestDto } from './dto/update-return-request.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, ReturnRequests } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class ReturnRequestsService {
  private readonly logger = new Logger(ReturnRequestsService.name);
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new return request for an order.
   *
   * This method performs the following operations:
   * 1. Creates return request record in database
   * 2. Logs successful creation
   * 3. Returns created return request
   *
   * @param {CreateReturnRequestDto} createReturnRequestDto - The return request data containing:
   *   - orderId, orderItemId, userId
   *   - returnReason, description
   *   - requestedRefundAmount
   *   - status (PENDING, APPROVED, REJECTED)
   *
   * @returns {Promise<ReturnRequests>} The created return request with details:
   *   - Return request ID, order/item IDs
   *   - Return reason and description
   *   - Refund amount, status
   *   - Created timestamp
   *
   * @throws {BadRequestException} If return request creation fails
   *
   * @remarks
   * - Used for product return processing
   * - Status typically starts as PENDING
   * - Links to specific order items
   * - Tracks refund amounts
   */
  async create(
    createReturnRequestDto: CreateReturnRequestDto,
  ): Promise<ReturnRequests> {
    try {
      const result = await this.prismaService.returnRequests.create({
        data: { ...createReturnRequestDto },
      });

      this.logger.log('Return request created successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error creating return request', error);
      throw new BadRequestException('Failed to create return request');
    }
  }

  /**
   * Retrieves paginated list of all return requests.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries all return requests from database
   * 3. Sorts results by return request ID ascending
   * 4. Returns paginated return request data
   * 5. Logs successful retrieval
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of return requests per page
   *
   * @returns {Promise<ReturnRequests[] | []>} Array of return requests or empty array:
   *   - Return request ID, order/item IDs, user ID
   *   - Return reason and description
   *   - Refund amount, status
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If return request retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by return request ID in ascending order
   * - Returns empty array if no return requests exist
   * - Used for admin return request management
   */
  async findAll(page: number, perPage: number): Promise<ReturnRequests[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ReturnRequests,
        Prisma.ReturnRequestsFindManyArgs
      >(
        this.prismaService.returnRequests,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Fetched return requests successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error fetching return requests', error);
      throw new BadRequestException('Failed to fetch return requests');
    }
  }

  /**
   * Retrieves a single return request by ID.
   *
   * This method performs the following operations:
   * 1. Queries return request by ID
   * 2. Validates return request exists
   * 3. Logs successful retrieval
   * 4. Returns return request details
   *
   * @param {number} id - The return request ID to retrieve
   *
   * @returns {Promise<ReturnRequests | null>} The return request with details:
   *   - Return request ID, order/item IDs, user ID
   *   - Return reason and description
   *   - Refund amount, status
   *   - Created/updated/resolved timestamps
   *
   * @throws {NotFoundException} If return request not found
   * @throws {BadRequestException} If return request retrieval fails
   *
   * @remarks
   * - Returns null if return request doesn't exist
   * - Used for viewing specific return request details
   * - Includes all return request information
   */
  async findOne(id: number): Promise<ReturnRequests | null> {
    try {
      const result = await this.prismaService.returnRequests.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Return request not found!');
      }

      this.logger.log('Fetched return request successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error fetching return request', error);
      throw new BadRequestException('Failed to fetch return request');
    }
  }

  /**
   * Updates an existing return request (typically status changes).
   *
   * This method performs the following operations:
   * 1. Updates return request in database
   * 2. Logs successful update
   * 3. Returns updated return request
   *
   * @param {number} id - The return request ID to update
   * @param {UpdateReturnRequestDto} updateReturnRequestDto - The update data containing:
   *   - status (PENDING → APPROVED/REJECTED)
   *   - returnReason, description (optional)
   *   - requestedRefundAmount, actualRefundAmount
   *   - processedByStaffId
   *
   * @returns {Promise<ReturnRequests>} The updated return request with all details
   *
   * @throws {BadRequestException} If return request update fails
   * @throws {NotFoundException} If return request not found
   *
   * @remarks
   * - Primarily used to change return request status
   * - Updates refund amounts when processing
   * - Tracks staff who processed the request
   * - Used during return request approval/rejection workflow
   */
  async update(
    id: number,
    updateReturnRequestDto: UpdateReturnRequestDto,
  ): Promise<ReturnRequests> {
    try {
      const result = await this.prismaService.returnRequests.update({
        where: { id: id },
        data: { ...updateReturnRequestDto },
      });

      this.logger.log('Return request updated successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error updating return request', error);
      throw new BadRequestException('Failed to update return request');
    }
  }

  /**
   * Deletes a return request by ID.
   *
   * This method performs the following operations:
   * 1. Logs deletion operation
   * 2. Deletes return request from database
   * 3. Returns deleted return request
   *
   * @param {number} id - The return request ID to delete
   *
   * @returns {Promise<ReturnRequests>} The deleted return request with all details
   *
   * @throws {BadRequestException} If return request deletion fails
   * @throws {NotFoundException} If return request not found
   *
   * @remarks
   * - This operation is irreversible
   * - May affect order item and refund records
   * - Database cascades handle related record cleanup
   * - Used for data cleanup and invalid request removal
   */
  async remove(id: number): Promise<ReturnRequests> {
    try {
      this.logger.log('Deleting return request', id);
      return await this.prismaService.returnRequests.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log('Error deleting return request', error);
      throw new BadRequestException('Failed to delete return request');
    }
  }
}
