import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Payments,
  PaymentStatus,
  Prisma,
  ShipmentStatus,
} from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import dayjs from 'dayjs';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new payment record for an order.
   *
   * This method performs the following operations:
   * 1. Creates a new payment in the database with provided data
   * 2. Logs the creation operation
   *
   * @param {CreatePaymentDto} createPaymentDto - The data transfer object containing payment information:
   *   - orderId: The ID of the order to link this payment to
   *   - amount: Payment amount
   *   - paymentMethod: Method of payment (COD, credit card, etc.)
   *   - status: Initial payment status (typically PENDING)
   *   - transactionId: Unique transaction identifier
   *
   * @returns {Promise<Payments>} The created payment record with all details
   *
   * @throws {BadRequestException} If payment creation fails
   *
   * @remarks
   * - Payment status typically starts as PENDING
   * - Used to track all payment attempts for an order
   */
  async create(createPaymentDto: CreatePaymentDto): Promise<Payments> {
    try {
      const result = await this.prismaService.payments.create({
        data: { ...createPaymentDto },
      });

      this.logger.log(`Payment created with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.log('Failed to create payment: ', error);
      throw new BadRequestException('Failed to create payment');
    }
  }

  /**
   * Retrieves a paginated list of all payments.
   *
   * This method performs the following operations:
   * 1. Fetches payments from the database with pagination
   * 2. Orders results by payment ID
   * 3. Logs pagination details
   *
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of payments to retrieve per page
   *
   * @returns {Promise<Payments[] | []>} Array of payments with all details
   *   Returns empty array if no payments found
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by payment ID in ascending order
   * - Empty array returned for consistency
   */
  async findAll(page: number, perPage: number): Promise<Payments[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Payments, Prisma.PaymentsFindManyArgs>(
        this.prismaService.payments,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Fetched all payments - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all payments: ', error);
      throw new BadRequestException('Failed to fetch all payments');
    }
  }

  /**
   * Retrieves a single payment record by ID.
   *
   * This method performs the following operations:
   * 1. Queries the database for the payment by ID
   * 2. Logs retrieval operation
   *
   * @param {number} id - The unique identifier of the payment to retrieve
   *
   * @returns {Promise<Payments | null>} The payment record with all details
   *   Returns null if payment not found
   *
   * @throws {NotFoundException} If payment is not found
   * @throws {BadRequestException} If data fetching fails
   *
   * @remarks
   * - Useful for fetching payment details for verification or status updates
   */
  async findOne(id: number): Promise<Payments | null> {
    try {
      const result = await this.prismaService.payments.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Payments not found!');
      }

      this.logger.log(`Fetched payment with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch payment: ', error);
      throw new BadRequestException('Failed to fetch payment');
    }
  }

  /**
   * Updates a payment record and creates a shipment when payment is confirmed.
   *
   * This method performs the following operations:
   * 1. Retrieves the current payment with order information
   * 2. Updates the payment with new status or information
   * 3. If payment transitions from PENDING to PAID:
   *    - Creates a new shipment record
   *    - Sets initial shipment status to WAITING_FOR_PICKUP
   *    - Assigns estimated delivery and ship dates
   * 4. Logs the update operation
   *
   * @param {number} id - The unique identifier of the payment to update
   * @param {UpdatePaymentDto} updatePaymentDto - The data transfer object containing payment updates:
   *   - status: New payment status (PENDING, PAID, FAILED, REFUNDED, etc.)
   *   - amount: Updated amount if applicable
   *
   * @param {string} shipmentCarrier - The shipping carrier name (used when creating shipment)
   *
   * @returns {Promise<Payments>} The updated payment record
   *
   * @throws {NotFoundException} If payment is not found
   * @throws {BadRequestException} If payment update fails
   *
   * @remarks
   * - Automatically triggers shipment creation on successful payment confirmation
   * - Generates unique tracking number for shipment
   * - Only creates shipment if payment transitions from PENDING to PAID
   */
  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
    shipmentCarrier: string,
  ): Promise<Payments> {
    try {
      const oldPayment = await this.prismaService.payments.findUnique({
        where: { id: id },
        include: {
          order: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!oldPayment) {
        throw new NotFoundException('Payment not found!');
      }

      const result = await this.prismaService.payments.update({
        where: { id: id },
        data: { ...updatePaymentDto },
      });

      if (
        result &&
        result.status === PaymentStatus.PAID &&
        oldPayment.status === PaymentStatus.PENDING
      ) {
        await this.prismaService.shipments.create({
          data: {
            orderId: result.orderId,
            processByStaffId: null,
            estimatedDelivery: dayjs().add(1, 'days').toDate(),
            estimatedShipDate: dayjs().add(2, 'days').toDate(),
            carrier: shipmentCarrier,
            trackingNumber: `${Date.now()}-${result.orderId}-${oldPayment.order.userId}-${Math.floor(
              Math.random() * 10000000,
            )}`,
            status: ShipmentStatus.WAITING_FOR_PICKUP,
          },
        });
      }

      this.logger.log(`Updated payment with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to update payment: ', error);
      throw new BadRequestException('Failed to update payment');
    }
  }

  /**
   * Deletes a payment record from the database.
   *
   * This method performs the following operations:
   * 1. Removes the payment record from the database
   * 2. Logs the deletion operation
   *
   * @param {number} id - The unique identifier of the payment to delete
   *
   * @returns {Promise<Payments>} The deleted payment record
   *
   * @throws {BadRequestException} If deletion fails or payment not found
   *
   * @remarks
   * - Verify before deletion as this action cannot be easily reversed
   * - Consider archiving instead of deleting for audit trail purposes
   * - Use with caution in production environments
   */
  async remove(id: number): Promise<Payments> {
    try {
      this.logger.log(`Removing payment with ID: ${id}`);
      return await this.prismaService.payments.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error('Failed to remove payment: ', error);
      throw new BadRequestException('Failed to remove payment');
    }
  }
}
