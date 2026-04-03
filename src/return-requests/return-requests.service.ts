import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import {
  UpdateReturnRequestDto,
  UserUpdateReturnRequestDto,
} from './dto/update-return-request.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  RequestStatus,
  RequestType,
  ReturnRequests,
  ShipmentStatus,
} from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class ReturnRequestsService {
  private readonly logger = new Logger(ReturnRequestsService.name);
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new return request for an order.
   *
   * Validates that the order belongs to the user, is delivered, has delivered shipments,
   * and does not already have a return request before writing the base request record and
   * the return-request record in one transaction.
   *
   * @param {CreateReturnRequestDto} createReturnRequestDto - The return request payload containing orderId, userId, description, and bank account information
   * @returns {Promise<ReturnRequests>} The created return request record linked to the base request record
   * @throws {NotFoundException} If the order does not exist, does not belong to the user, or is not eligible for return
   * @throws {BadRequestException} If a duplicate return request exists, bank information is incomplete, or creation fails
   * @remarks This flow is DB-only and does not call VNPay refund APIs.
   */
  async create(
    createReturnRequestDto: CreateReturnRequestDto,
  ): Promise<ReturnRequests> {
    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        const { orderId, userId } = createReturnRequestDto;

        const orderNeedsReturn = await tx.orders.findFirst({
          where: {
            id: orderId,
            userId: userId,
            status: OrderStatus.DELIVERED,
            shipments: {
              every: {
                status: ShipmentStatus.DELIVERED,
              },
            },
          },
          include: {
            requests: {
              where: {
                subject: RequestType.RETURN_REQUEST,
              },
            },
          },
        });

        if (!orderNeedsReturn) {
          this.logger.error(
            `User attempted to create return request for order that does not exist or does not belong to them: orderId=${orderId}, userId=${userId}`,
          );
          throw new NotFoundException(
            'User attempted to create return request for order that does not exist or does not belong to them',
          );
        }

        if (orderNeedsReturn.requests.length > 0) {
          this.logger.error(
            `User attempted to create duplicate return request for order: orderId=${orderId}, userId=${userId}`,
          );
          throw new BadRequestException(
            'A return request for this order already exists',
          );
        }

        if (
          !createReturnRequestDto.bankAccountName ||
          !createReturnRequestDto.bankAccountNumber ||
          !createReturnRequestDto.bankName
        ) {
          this.logger.error(
            `User attempted to create return request without providing complete bank information: orderId=${orderId}, userId=${userId}`,
          );
          throw new BadRequestException(
            'Bank account name, number, and bank name are required for return request',
          );
        }

        this.logger.log(
          'Creating return request',
          JSON.stringify(createReturnRequestDto),
        );

        const newRequest = await tx.requests.create({
          data: {
            orderId: createReturnRequestDto.orderId,
            userId: createReturnRequestDto.userId,
            subject: RequestType.RETURN_REQUEST,
            status: RequestStatus.PENDING,
            description: createReturnRequestDto.description,
          },
        });

        const result = await tx.returnRequests.create({
          data: {
            requestId: newRequest.id,
            bankName: createReturnRequestDto.bankName,
            bankAccountNumber: createReturnRequestDto.bankAccountNumber,
            bankAccountName: createReturnRequestDto.bankAccountName,
          },
        });

        return result;
      });

      this.logger.log('Return request created successfully', result.id);
      return result;
    } catch (error) {
      this.logger.error('Error creating return request', error);
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
      this.logger.error('Error fetching return requests', error);
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
      this.logger.error('Error fetching return request', error);
      throw new BadRequestException('Failed to fetch return request');
    }
  }

  /**
   * Allows a user to update their own PENDING return request details.
   *
   * Users can only update bank account information and description for return requests
   * that are in PENDING status (not yet reviewed by staff). Once staff marks the request
   * as IN_PROGRESS or makes a final decision, users cannot modify it.
   *
   * Bank field update is all-or-nothing: either provide all three (bankName, bankAccountNumber,
   * bankAccountName), or provide none (no partial updates).
   *
   * Validates that:
   * - Return request exists by ID
   * - Return request belongs to the authenticated user (via order.userId)
   * - Associated request type is RETURN_REQUEST
   * - Current request status is PENDING (not yet processed by staff)
   * - If bank fields are provided, all three must be provided (not partial)
   *
   * Executes within a Prisma transaction to ensure atomicity: fetches, validates all rules,
   * then updates both ReturnRequests and Requests records.
   *
   * @param {number} id - The return request ID to update
   * @param {UserUpdateReturnRequestDto} userUpdateReturnRequestDto - Update payload:
   *   - bankName?: VietnamBankName (optional)
   *   - bankAccountNumber?: string (optional)
   *   - bankAccountName?: string (optional)
   *   - description?: string (optional)
   *   Note: All bank fields are optional, but if any is provided, all three are required
   *
   * @returns {Promise<ReturnRequests>} Updated return request with nested request relation
   *
   * @throws {NotFoundException} If:
   *   - Return request not found by ID
   *   - Order not found or return request does not belong to user
   *
   * @throws {BadRequestException} If:
   *   - Associated request is not a RETURN_REQUEST type
   *   - Request status is not PENDING (already processing or finalized)
   *   - Bank fields are partially provided (all or none required)
   *   - Update operation fails
   *
   * @remarks
   * - Users can only edit PENDING requests (immutable once staff reviews)
   * - Bank field update enforces all-or-nothing consistency
   * - DB-only operation; does not call external refund APIs
   * - Requires user ownership verification via order relationship
   */
  async userUpdateReturnRequest(
    id: number,
    userId: bigint,
    userUpdateReturnRequestDto: UserUpdateReturnRequestDto,
  ): Promise<ReturnRequests> {
    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        // Step 1: Fetch return request with all necessary relations for validation
        const returnRequest = await tx.returnRequests.findFirst({
          where: { id: id },
          include: {
            request: true,
          },
        });

        // Step 2: Validate return request exists
        if (!returnRequest) {
          this.logger.error(`Return request not found for ID: ${id}`);
          throw new NotFoundException('Return request not found');
        }

        // Step 3: Fetch associated order to verify user ownership
        const order = await tx.orders.findFirst({
          where: {
            id: returnRequest.request.orderId,
          },
        });

        if (!order) {
          this.logger.error(`Order not found for return request ID: ${id}`);
          throw new NotFoundException('Associated order not found');
        }

        // Step 4: Validate user ownership
        if (order.userId !== userId) {
          this.logger.error(
            `User ${userId} attempted to update return request ${id} that does not belong to them`,
          );
          throw new BadRequestException(
            'Return request does not belong to this user',
          );
        }

        // Step 5: Validate request type is RETURN_REQUEST
        if (
          !returnRequest.request.subject ||
          returnRequest.request.subject !== RequestType.RETURN_REQUEST
        ) {
          this.logger.error(
            `Associated request is not a RETURN_REQUEST type for return request ID: ${id}`,
          );
          throw new BadRequestException(
            'Associated request is not a return request type',
          );
        }

        // Step 6: Validate request status is PENDING (user can only edit PENDING requests)
        if (returnRequest.request.status !== RequestStatus.PENDING) {
          this.logger.error(
            `User attempted to update non-PENDING return request. Current status: ${returnRequest.request.status} for return request ID: ${id}`,
          );
          throw new BadRequestException(
            'Can only update return requests in PENDING status',
          );
        }

        // Step 7: Validate bank fields: all-or-nothing consistency
        const providedBankFields = [
          userUpdateReturnRequestDto.bankName,
          userUpdateReturnRequestDto.bankAccountNumber,
          userUpdateReturnRequestDto.bankAccountName,
        ].filter((field) => field !== undefined && field !== null);

        const hasSomeBankFields = providedBankFields.length > 0;
        const hasAllBankFields = providedBankFields.length === 3;

        if (hasSomeBankFields && !hasAllBankFields) {
          this.logger.error(
            `User provided incomplete bank information for return request ID: ${id}. Provided ${providedBankFields.length} of 3 fields`,
          );
          throw new BadRequestException(
            'Bank account information must be provided completely (all three fields) or not at all',
          );
        }

        this.logger.log(
          'User updating return request',
          JSON.stringify({ id, userId, ...userUpdateReturnRequestDto }),
        );

        // Step 8: Update ReturnRequests and optionally update description in Requests
        const updatedReturnRequest = await tx.returnRequests.update({
          where: { id: id },
          include: { request: true },
          data: {
            bankName: userUpdateReturnRequestDto.bankName,
            bankAccountNumber: userUpdateReturnRequestDto.bankAccountNumber,
            bankAccountName: userUpdateReturnRequestDto.bankAccountName,
          },
        });

        // Step 9: Update description in associated Requests record if provided
        if (userUpdateReturnRequestDto.description) {
          await tx.requests.update({
            where: { id: returnRequest.request.id },
            data: {
              description: userUpdateReturnRequestDto.description,
            },
          });
        }

        this.logger.log('Return request updated successfully by user', id);
        return updatedReturnRequest;
      });

      return result;
    } catch (error) {
      this.logger.error('Error updating return request by user', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update return request');
    }
  }

  /**
   * Updates a return request during staff processing workflow.
   *
   * This method performs the following operations:
   * 1. Finds return request with related base request record
   * 2. Validates request exists and subject is RETURN_REQUEST
   * 3. Validates current status is PENDING or IN_PROGRESS
   * 4. Validates target status is IN_PROGRESS, APPROVED, or REJECTED (PENDING is not allowed)
   * 5. Enforces transition rules:
   *    - PENDING can only move to IN_PROGRESS
   *    - IN_PROGRESS can move to APPROVED or REJECTED
   *    - IN_PROGRESS to IN_PROGRESS is blocked (same-status update)
   * 6. Updates request processor (`processByStaffId`) and status in one transaction
   * 7. If transition is IN_PROGRESS -> APPROVED, applies return side effects:
   *    - Updates order status to RETURNED
   *    - Updates all shipments of the order to RETURNED
   *    - Updates all payments of the order to REFUNDED
   * 8. Logs all important transition events and side effects
   *
   * @param {number} id - The return request ID to update
   * @param {UpdateReturnRequestDto} updateReturnRequestDto - The update payload containing:
   *   - processByStaffId: Staff ID that handles the request
   *   - status: New status (IN_PROGRESS, APPROVED, or REJECTED)
   *
   * @returns {Promise<ReturnRequests>} The updated return request record
   *
   * @throws {NotFoundException} If return request is not found by ID
   * @throws {BadRequestException} If:
   *   - Associated base request is not RETURN_REQUEST type
   *   - Current status is not PENDING or IN_PROGRESS
   *   - Target status is invalid or set to PENDING
   *   - PENDING is updated directly to APPROVED/REJECTED
   *   - IN_PROGRESS is updated to IN_PROGRESS (same status)
   *   - Transaction fails while updating request/order/shipment/payment state
   *
   * @remarks
   * - Staff workflow is enforced: PENDING -> IN_PROGRESS -> (APPROVED|REJECTED)
   * - Approval triggers order/shipments/payments state synchronization for return flow
   * - All writes run inside a single Prisma transaction for consistency
   * - DB-only operation; does not call external refund APIs
   */
  async update(
    id: number,
    updateReturnRequestDto: UpdateReturnRequestDto,
  ): Promise<ReturnRequests> {
    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        const existingReturnRequest = await tx.returnRequests.findFirst({
          where: { id: id },
          include: {
            request: true,
          },
        });

        if (!existingReturnRequest) {
          this.logger.error(`Return request not found for ID: ${id}`);
          throw new NotFoundException('Return request not found!');
        }

        if (
          !existingReturnRequest.request.subject ||
          existingReturnRequest.request.subject !== RequestType.RETURN_REQUEST
        ) {
          this.logger.error(
            `Associated request is not a return request for return request ID: ${id}`,
          );
          throw new BadRequestException(
            'Associated request is not a return request',
          );
        }

        if (
          existingReturnRequest.request.status !== RequestStatus.PENDING &&
          existingReturnRequest.request.status !== RequestStatus.IN_PROGRESS
        ) {
          this.logger.error(
            `Only pending or in-progress return requests can be updated. Current status: ${existingReturnRequest.request.status} for return request ID: ${id}`,
          );
          throw new BadRequestException(
            'Only pending or in-progress return requests can be updated',
          );
        }

        if (
          updateReturnRequestDto.status === RequestStatus.PENDING ||
          ![
            RequestStatus.APPROVED,
            RequestStatus.REJECTED,
            RequestStatus.IN_PROGRESS,
          ].includes(updateReturnRequestDto.status)
        ) {
          this.logger.error(
            `Invalid status update. Status must be APPROVED, REJECTED, or IN_PROGRESS for return request ID: ${id}`,
          );
          throw new BadRequestException(
            'Invalid status update. Status must be APPROVED or REJECTED or IN_PROGRESS.',
          );
        }

        if (
          existingReturnRequest.request.status === RequestStatus.IN_PROGRESS &&
          updateReturnRequestDto.status === RequestStatus.IN_PROGRESS
        ) {
          this.logger.error(
            `Return request is already in progress and cannot be updated to the same status for return request ID: ${id}`,
          );
          throw new BadRequestException(
            'Return request is already in progress and cannot be updated to the same status.',
          );
        }

        if (
          existingReturnRequest.request.status === RequestStatus.PENDING &&
          updateReturnRequestDto.status !== RequestStatus.IN_PROGRESS
        ) {
          this.logger.error(
            `Invalid status update. Status must be IN_PROGRESS for updated return request ID: ${id}`,
          );
          throw new BadRequestException(
            `Invalid status update. Status must be IN_PROGRESS for updated return request ID: ${id}.`,
          );
        }

        this.logger.log(
          'Updating return request',
          JSON.stringify({ id, ...updateReturnRequestDto }),
        );

        const result = await tx.returnRequests.update({
          where: {
            id: id,
          },
          data: {
            request: {
              update: {
                processByStaffId: updateReturnRequestDto.processByStaffId,
                status: updateReturnRequestDto.status,
              },
            },
          },
        });

        if (
          existingReturnRequest.request.status === RequestStatus.IN_PROGRESS &&
          updateReturnRequestDto.status === RequestStatus.APPROVED
        ) {
          this.logger.log(
            'Return request approved',
            `Return request ID: ${id} has been approved by staff ID: ${updateReturnRequestDto.processByStaffId}`,
          );

          // update order status to RETURNED if approved
          // update shipment status to RETURNED if approved
          // update payment status to REFUNDED if approved
          await tx.orders.update({
            where: { id: existingReturnRequest.request.orderId },
            data: { status: OrderStatus.RETURNED },
          });
          this.logger.log(
            'Order status updated to RETURNED',
            `Order ID: ${existingReturnRequest.request.orderId} status updated to RETURNED due to approved return request ID: ${id}`,
          );

          await tx.shipments.updateMany({
            where: { orderId: existingReturnRequest.request.orderId },
            data: { status: ShipmentStatus.RETURNED },
          });
          this.logger.log(
            'Shipment status updated to RETURNED',
            `Shipments for order ID: ${existingReturnRequest.request.orderId} status updated to RETURNED due to approved return request ID: ${id}`,
          );

          await tx.payments.updateMany({
            where: { orderId: existingReturnRequest.request.orderId },
            data: { status: PaymentStatus.REFUNDED },
          });
          this.logger.log(
            'Payment status updated to REFUNDED',
            `Payments for order ID: ${existingReturnRequest.request.orderId} status updated to REFUNDED due to approved return request ID: ${id}`,
          );
        }

        this.logger.log('Return request updated successfully', id);
        return result;
      });

      return result;
    } catch (error) {
      this.logger.error('Error updating return request', error);
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
      this.logger.error('Error deleting return request', error);
      throw new BadRequestException('Failed to delete return request');
    }
  }
}
