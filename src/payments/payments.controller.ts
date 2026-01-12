import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentEntity } from './entities/payment.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: 201,
    description: 'Create a new payment',
    type: PaymentEntity,
  })
  @ApiBody({ type: CreatePaymentDto })
  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentsService.create(createPaymentDto);
  }

  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({
    status: 200,
    description: 'Get all payments',
    type: [PaymentEntity],
  })
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.paymentsService.findAll(Number(page), Number(perPage));
  }

  @ApiOperation({ summary: 'Get one payment' })
  @ApiResponse({
    status: 200,
    description: 'Get one payment',
    type: PaymentEntity,
  })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.paymentsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update one payment' })
  @ApiResponse({
    status: 200,
    description: 'Update one payment',
    type: PaymentEntity,
  })
  @ApiBody({ type: UpdatePaymentDto })
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
    description: 'Delete one payment',
    type: PaymentEntity,
  })
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.paymentsService.remove(+id);
  }
}
