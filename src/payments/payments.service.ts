import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { OrderStatus, Payments, PaymentStatus, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import {
  BuildPaymentUrlOptions,
  QueryDrOptions,
  RefundOptions,
  VerifyIpnCallOptions,
  VerifyReturnUrlOptions,
  VnpayService,
} from 'nestjs-vnpay';
import {
  type Bank,
  type BuildPaymentUrl,
  type VerifyReturnUrl,
  type ReturnQueryFromVNPay,
  type VerifyIpnCall,
  type QueryDrResponse,
  type QueryDr,
  type Refund,
  IpnFailChecksum,
  IpnResponse,
  IpnSuccess,
  IpnOrderNotFound,
  IpnInvalidAmount,
  InpOrderAlreadyConfirmed,
  IpnUnknownError,
} from 'vnpay';
import { CreateVNPayPaymentUrlDto } from './dto/create-vnpay-payment-url.dto';
import {
  ReturnQueryFromVNPayDto,
  VerifyVNPayReturnUrlDto,
} from './dto/verify-vnpay-return-url.dto';
import { VerifyVNPayIPNCallDto } from './dto/verify-vnpay-ipn-call.dto';
import { VnpayQueryDrDto } from './dto/vnpay-query-dr.dto';
import { VnpayRefundDto } from './dto/vnpay-refund.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly vnpayService: VnpayService,
  ) {}

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
      this.logger.error('Failed to create payment: ', error);
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
   * Updates an existing payment record by ID.
   *
   * This method performs the following operations:
   * 1. Receives payment ID and partial update payload
   * 2. Applies updates directly to the payment record in database
   * 3. Returns the updated payment entity
   * 4. Logs update success or failure
   *
   * @param {number} id - The unique identifier of the payment to update
   * @param {UpdatePaymentDto} updatePaymentDto - Partial payment fields to update:
   *   - status: Payment status (PENDING, PAID, FAILED, REFUNDED, etc.)
   *   - paymentMethod: Updated payment method if needed
   *   - transactionId: Updated transaction reference
   *   - amount/currencyUnit: Updated payment amount information
   *
   * @returns {Promise<Payments>} The updated payment record
   *
   * @throws {BadRequestException} If payment update fails
   *
   * @remarks
   * - This method only updates payment data
   * - Shipment creation is not handled in this method
   * - Input shape is based on UpdatePaymentDto (PartialType of CreatePaymentDto)
   */
  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payments> {
    try {
      const result = await this.prismaService.payments.update({
        where: { id: id },
        data: { ...updatePaymentDto },
      });

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

  /**
   * Retrieves the list of banks currently supported by VNPay.
   *
   * This method performs the following operations:
   * 1. Calls VNPay SDK to fetch available bank list
   * 2. Logs request and response information
   * 3. Returns the normalized bank list from VNPay
   *
   * @returns {Promise<Bank[]>} List of VNPay-supported banks
   *
   * @throws {BadRequestException} If VNPay bank list retrieval fails
   *
   * @remarks
   * - Used by clients to render selectable payment bank options
   * - Response is provided directly from VNPay SDK
   */
  async getVNPayBankList(): Promise<Bank[]> {
    try {
      this.logger.log('Fetching VNPAY bank list');
      const result = await this.vnpayService.getBankList();
      this.logger.log('Retrieved VNPAY bank list: ', JSON.stringify(result));
      return result;
    } catch (error) {
      this.logger.error('Failed to get bank list: ', error);
      throw new BadRequestException('Failed to get bank list');
    }
  }

  /**
   * Builds a VNPay checkout URL from payment request payload.
   *
   * This method performs the following operations:
   * 1. Receives VNPay build URL DTO with request data and options
   * 2. Casts DTO payload into VNPay SDK compatible types
   * 3. Calls VNPay SDK to generate signed payment URL
   * 4. Logs the generated URL and returns it
   *
   * @param {CreateVNPayPaymentUrlDto} createVNPayPaymentUrlDto - VNPay URL build payload:
   *   - data: Payment request fields (amount, txnRef, order info, return URL, etc.)
   *   - options: Build options for hashing/logger behavior
   *
   * @returns {string} VNPay payment URL for redirecting customer to checkout
   *
   * @throws {BadRequestException} If payment URL generation fails
   *
   * @remarks
   * - URL is signed by VNPay SDK to ensure integrity
   * - Caller should redirect client immediately after URL is generated
   */
  buildVNPayPaymentUrl(
    createVNPayPaymentUrlDto: CreateVNPayPaymentUrlDto,
  ): string {
    try {
      this.logger.log(
        'Building VNPAY payment URL with data: ',
        JSON.stringify(createVNPayPaymentUrlDto),
      );
      const { data, options } = createVNPayPaymentUrlDto;
      // Cast to compatible types for vnpay library
      const result = this.vnpayService.buildPaymentUrl(
        data as BuildPaymentUrl,
        options as BuildPaymentUrlOptions,
      );
      this.logger.log('Generated VNPAY payment URL: ', JSON.stringify(result));
      return result;
    } catch (error) {
      this.logger.error('Failed to build VNPAY payment URL: ', error);
      throw new BadRequestException('Failed to build VNPAY payment URL');
    }
  }

  /**
   * Verifies VNPay return URL data after customer is redirected back.
   *
   * This method performs the following operations:
   * 1. Receives return query payload and verify options
   * 2. Calls VNPay SDK to verify signature and response data
   * 3. Logs verification input and output
   * 4. Returns verification result for caller-side handling
   *
   * @param {VerifyVNPayReturnUrlDto} verifyVNPayReturnUrlDto - Return URL verification payload:
   *   - data: Query params returned by VNPay
   *   - options: Verify options (hash validation, logger, etc.)
   *
   * @returns {Promise<VerifyReturnUrl>} VNPay return verification result
   *
   * @throws {BadRequestException} If verification process fails
   *
   * @remarks
   * - This method verifies return URL authenticity but does not persist order/payment state
   * - Payment finalization should rely on IPN processing for authoritative updates
   */
  async verifyVNPayReturnUrl(
    verifyVNPayReturnUrlDto: VerifyVNPayReturnUrlDto,
  ): Promise<VerifyReturnUrl> {
    try {
      this.logger.log(
        'Verifying VNPAY return URL with data: ',
        JSON.stringify(verifyVNPayReturnUrlDto),
      );
      const { data, options } = verifyVNPayReturnUrlDto;
      const result = await this.vnpayService.verifyReturnUrl(
        data as ReturnQueryFromVNPay,
        options as VerifyReturnUrlOptions,
      );
      this.logger.log('Verified VNPAY return URL: ', JSON.stringify(result));
      return result;
    } catch (error) {
      this.logger.error('Failed to verify VNPAY return URL: ', error);
      throw new BadRequestException('Failed to verify VNPAY return URL');
    }
  }

  /**
   * Handles VNPay IPN callback and synchronizes payment/order state.
   *
   * This method performs the following operations:
   * 1. Builds internal verify DTO from incoming VNPay query params
   * 2. Verifies IPN signature and payload via VNPay SDK
   * 3. Validates order existence, expected amount, and payment state
   * 4. Updates payment to PAID and stores VNPay transaction number
   * 5. Updates order status to PAYMENT_CONFIRMED in one transaction
   * 6. Returns VNPay-compatible IPN response code object
   *
   * @param {ReturnQueryFromVNPayDto} query - Raw VNPay IPN query parameters
   *
   * @returns {Promise<IpnResponse>} VNPay IPN handling response:
   *   - IpnSuccess when verification and DB updates succeed
   *   - IpnFailChecksum when signature verification fails
   *   - IpnOrderNotFound when order does not exist
   *   - IpnInvalidAmount when amount mismatch is detected
   *   - InpOrderAlreadyConfirmed when payment is already confirmed
   *   - IpnUnknownError for unexpected failures
   *
   * @remarks
   * - IPN path is the authoritative source for payment confirmation
   * - Payment and order updates are wrapped in one DB transaction
   * - Assumes one payment record per order and reads the first payment element
   */
  async handleVNPayIPNCall(
    query: ReturnQueryFromVNPayDto,
  ): Promise<IpnResponse> {
    try {
      this.logger.log(
        'Verifying VNPAY IPN call with data: ',
        JSON.stringify(query),
      );

      const verifyVNPayIPNCallDto: VerifyVNPayIPNCallDto = {
        data: query,
        options: {
          withHash: true,
          logger: {
            type: 'all',
          },
        },
      };

      this.logger.log(
        'Constructed VerifyVNPayIPNCallDto: ',
        JSON.stringify(verifyVNPayIPNCallDto),
      );

      const { data, options } = verifyVNPayIPNCallDto;
      const verifyIPNCallResult: VerifyIpnCall =
        await this.vnpayService.verifyIpnCall(
          data as ReturnQueryFromVNPay,
          options as VerifyIpnCallOptions,
        );
      this.logger.log(
        'Verified VNPAY IPN call: ',
        JSON.stringify(verifyIPNCallResult),
      );

      if (!verifyIPNCallResult.isVerified) {
        this.logger.error(
          'VNPAY IPN call verification failed: Is not verified',
        );
        return IpnFailChecksum;
      }

      const foundOrder = await this.prismaService.orders.findUnique({
        where: {
          id: Number(verifyIPNCallResult.vnp_TxnRef),
        },
        include: {
          payment: true,
        },
      });

      if (!foundOrder) {
        this.logger.error(
          'VNPAY IPN call verification failed: Order not found with ID ' +
            verifyIPNCallResult.vnp_TxnRef,
        );
        return IpnOrderNotFound;
      }

      if (foundOrder.totalAmount !== Number(verifyIPNCallResult.vnp_Amount)) {
        this.logger.error(
          'VNPAY IPN call verification failed: Invalid amount for order with ID ' +
            verifyIPNCallResult.vnp_TxnRef,
        );
        return IpnInvalidAmount;
      }

      if (foundOrder.payment[0].status === PaymentStatus.PAID) {
        this.logger.error(
          'VNPAY IPN call verification failed: Order already confirmed for order with ID ' +
            verifyIPNCallResult.vnp_TxnRef,
        );
        return InpOrderAlreadyConfirmed;
      }

      // update db here
      // update payment to Paid
      // update order status to Confirmed
      await this.prismaService.$transaction(async (tx) => {
        // update payment to Paid
        // update transaction id to vnpay transaction id
        const updatePayment = await tx.payments.update({
          where: {
            // when order created, we create only one payment, so we can safely access the first element
            id: foundOrder.payment[0].id,
          },
          data: {
            status: PaymentStatus.PAID,
            transactionId: String(verifyIPNCallResult.vnp_TransactionNo),
          },
        });

        if (!updatePayment) {
          this.logger.log(
            '[handleVNPayIPNCall] Failed to update payment for order ID: ',
            foundOrder.id,
          );
          throw new Error(
            'Failed to update payment for order ID: ' + foundOrder.id,
          );
        }

        // update order status to Confirmed
        const updateOrder = await tx.orders.update({
          where: {
            id: foundOrder.id,
          },
          data: {
            status: OrderStatus.PAYMENT_CONFIRMED,
          },
        });

        if (!updateOrder) {
          this.logger.log(
            '[handleVNPayIPNCall] Failed to update order status to PAYMENT_CONFIRMED for order ID: ',
            foundOrder.id,
          );
          throw new Error(
            'Failed to update order status to PAYMENT_CONFIRMED for order ID: ' +
              foundOrder.id,
          );
        }
      });

      return IpnSuccess;
    } catch (error) {
      this.logger.error(
        '[handleVNPayIPNCall] Failed to process VNPAY IPN call: ',
        error,
      );
      return IpnUnknownError;
    }
  }

  /**
   * Queries VNPay transaction details/status using QueryDR API.
   *
   * This method performs the following operations:
   * 1. Receives QueryDR payload and options
   * 2. Calls VNPay SDK queryDr endpoint
   * 3. Logs request and response
   * 4. Returns VNPay transaction query result
   *
   * @param {VnpayQueryDrDto} vnpayQueryDrDto - VNPay QueryDR request payload:
   *   - data: Query fields (transaction reference/time, etc.)
   *   - options: Query options for signing/logger behavior
   *
   * @returns {Promise<QueryDrResponse>} VNPay QueryDR response data
   *
   * @throws {BadRequestException} If QueryDR request fails
   *
   * @remarks
   * - Useful for manual reconciliation and troubleshooting payment disputes
   * - Response structure is controlled by VNPay SDK
   */
  async VNPayQueryDr(
    vnpayQueryDrDto: VnpayQueryDrDto,
  ): Promise<QueryDrResponse> {
    try {
      this.logger.log(
        'Querying VNPAY DR with data: ',
        JSON.stringify(vnpayQueryDrDto),
      );
      const { data, options } = vnpayQueryDrDto;
      const result = await this.vnpayService.queryDr(
        data as QueryDr,
        options as QueryDrOptions,
      );
      this.logger.log('Queried VNPAY DR: ', JSON.stringify(result));
      return result;
    } catch (error) {
      this.logger.error('Failed to query VNPAY DR: ', error);
      throw new BadRequestException('Failed to query VNPAY DR');
    }
  }

  /**
   * Sends a refund request to VNPay for a previously processed transaction.
   *
   * This method performs the following operations:
   * 1. Receives refund payload and options
   * 2. Calls VNPay SDK refund endpoint
   * 3. Logs request and refund result
   * 4. Returns VNPay refund response to caller
   *
   * @param {VnpayRefundDto} vnpayRefundDto - VNPay refund payload:
   *   - data: Refund details (transaction reference, amount, user, command, etc.)
   *   - options: Refund options for signing/logger behavior
   *
   * @returns {Promise<unknown>} VNPay refund response payload from SDK
   *
   * @throws {BadRequestException} If VNPay refund request fails
   *
   * @remarks
   * - This method forwards response from VNPay SDK without extra business mapping
   * - Caller should persist refund outcome to internal payment/order state if needed
   */
  async VNPayRefund(vnpayRefundDto: VnpayRefundDto) {
    try {
      this.logger.log(
        'Processing VNPAY refund with data: ',
        JSON.stringify(vnpayRefundDto),
      );
      const { data, options } = vnpayRefundDto;
      const result = await this.vnpayService.refund(
        data as Refund,
        options as RefundOptions,
      );
      this.logger.log('Processed VNPAY refund: ', JSON.stringify(result));
      return result;
    } catch (error) {
      this.logger.error('Failed to process VNPAY refund: ', error);
      throw new BadRequestException('Failed to process VNPAY refund');
    }
  }
}
