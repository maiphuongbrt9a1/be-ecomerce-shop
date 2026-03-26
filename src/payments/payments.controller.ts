import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateVNPayPaymentUrlDto } from './dto/create-vnpay-payment-url.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { PaymentEntity } from './entities/payment.entity';
import { Public, Roles } from '@/decorator/customize';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { VnpayRefundDto } from './dto/vnpay-refund.dto';
import { VnpayQueryDrDto } from './dto/vnpay-query-dr.dto';
import {
  ReturnQueryFromVNPayDto,
  VerifyVNPayReturnUrlDto,
} from './dto/verify-vnpay-return-url.dto';
import {
  VNPayBankResponseDto,
  VNPayQueryDrResponseDto,
  VNPayRefundResponseDto,
  VNPayVerifyIpnCallResponseDto,
  VNPayVerifyReturnUrlResponseDto,
} from './dto/vnpay-response.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: PaymentEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiBody({
    description:
      'Payment creation data with order, transaction, method, and amount information',
    type: CreatePaymentDto,
  })
  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentsService.create(createPaymentDto);
  }

  @ApiOperation({ summary: 'Build VNPay payment URL' })
  @ApiResponse({
    status: 200,
    description: 'Built VNPay payment URL successfully',
    schema: {
      type: 'string',
      example:
        'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15000000&vnp_TxnRef=ORDER_12345&vnp_SecureHash=...',
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR', 'USER')
  @ApiBody({
    description:
      'VNPay payment URL payload with BuildPaymentUrl data and optional BuildPaymentUrlOptions',
    type: CreateVNPayPaymentUrlDto,
  })
  @Post('/vnpay-payment-url')
  buildVNPayPaymentUrl(
    @Body() createVNPayPaymentUrlDto: CreateVNPayPaymentUrlDto,
  ) {
    return this.paymentsService.buildVNPayPaymentUrl(createVNPayPaymentUrlDto);
  }

  @ApiOperation({ summary: 'Verify VNPay return URL after payment' })
  @ApiResponse({
    status: 200,
    description: 'VNPay return URL verified successfully',
    type: VNPayVerifyReturnUrlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request or Invalid signature.',
  })
  @ApiBody({
    description: 'VNPay return URL data with query parameters from callback',
    type: VerifyVNPayReturnUrlDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR', 'USER')
  @Post('/check-vnpay-return')
  async verifyVNPayReturnUrl(
    @Body() verifyVNPayReturnUrlDto: VerifyVNPayReturnUrlDto,
  ) {
    return await this.paymentsService.verifyVNPayReturnUrl(
      verifyVNPayReturnUrlDto,
    );
  }

  @ApiOperation({ summary: 'Handle VNPay IPN (Instant Payment Notification)' })
  @ApiResponse({
    status: 200,
    description: 'IPN verified successfully',
    type: VNPayVerifyIpnCallResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request or Invalid signature.',
  })
  @ApiBody({
    description: 'VNPay IPN callback data',
    type: ReturnQueryFromVNPayDto,
  })
  @Public()
  @Get('/vnpay_ipn')
  async handleVNPayIPNCall(@Query() query: ReturnQueryFromVNPayDto) {
    return await this.paymentsService.handleVNPayIPNCall(query);
  }

  @ApiOperation({ summary: 'Query VNPay transaction status (Query DR)' })
  @ApiResponse({
    status: 200,
    description: 'Transaction status retrieved successfully',
    type: VNPayQueryDrResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    description: 'VNPay query dispute record data',
    type: VnpayQueryDrDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR', 'USER')
  @Post('/vnpay-query-dr')
  async VNPayQueryDr(@Body() vnpayQueryDrDto: VnpayQueryDrDto) {
    return await this.paymentsService.VNPayQueryDr(vnpayQueryDrDto);
  }

  @ApiOperation({ summary: 'Process VNPay refund' })
  @ApiResponse({
    status: 200,
    description: 'Refund processed successfully',
    type: VNPayRefundResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @ApiBody({
    description: 'VNPay refund request data',
    type: VnpayRefundDto,
  })
  @Post('/vnpay-refund')
  async VNPayRefund(@Body() vnpayRefundDto: VnpayRefundDto) {
    return await this.paymentsService.VNPayRefund(vnpayRefundDto);
  }

  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all payments successfully',
    type: [PaymentEntity],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of items per page',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR', 'USER')
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.paymentsService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get list of supported banks by VNPAY' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved bank list successfully',
    type: [VNPayBankResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR', 'USER')
  @Get('/vnpay-banks')
  async getBankList() {
    return await this.paymentsService.getVNPayBankList();
  }

  @ApiOperation({ summary: 'Get one payment' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved payment successfully',
    type: PaymentEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR', 'USER')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.paymentsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment updated successfully',
    type: PaymentEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR', 'USER')
  @ApiBody({
    description:
      'Partial payment update payload. Only payment fields are updated (status, amount, transaction/payment metadata). This endpoint does not create shipment records.',
    type: UpdatePaymentDto,
  })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return await this.paymentsService.update(+id, updatePaymentDto);
  }

  @ApiOperation({ summary: 'Delete one payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment deleted successfully',
    type: PaymentEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR', 'USER')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.paymentsService.remove(+id);
  }
}
