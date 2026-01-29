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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { PaymentEntity } from './entities/payment.entity';
import { Roles } from '@/decorator/customize';
import { RolesGuard } from '@/auth/passport/permission.guard';

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
      'Payment update data with status and optional transaction or method information. Also include shipmentCarrier for creating shipment when payment is marked as PAID',
    type: UpdatePaymentDto,
  })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Body('shipmentCarrier') shipmentCarrier: string,
  ) {
    return await this.paymentsService.update(
      +id,
      updatePaymentDto,
      shipmentCarrier,
    );
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
