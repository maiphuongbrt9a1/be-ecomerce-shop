import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ReturnRequestsService } from './return-requests.service';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import {
  UpdateReturnRequestDto,
  UserUpdateReturnRequestDto,
} from './dto/update-return-request.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import { ReturnRequestEntity } from './entities/return-request.entity';
import type { RequestWithUserInJWTStrategy } from '@/helpers/auth/interfaces/RequestWithUser.interface';

@Controller('return-requests')
export class ReturnRequestsController {
  constructor(private readonly returnRequestsService: ReturnRequestsService) {}

  @ApiOperation({
    summary: 'Create a new return request',
    description:
      'Creates a return request for a delivered order that belongs to the authenticated user. The request is stored in the database only and does not call VNPay refund APIs.',
  })
  @ApiResponse({
    status: 201,
    description: 'Return request created successfully',
    type: ReturnRequestEntity,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - duplicate return request, incomplete bank information, or invalid return request data',
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found - order does not exist, does not belong to the user, or is not eligible for return',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @ApiBody({
    description:
      'Return request payload containing orderId, userId, description, and bank account information',
    type: CreateReturnRequestDto,
  })
  @Post()
  async create(@Body() createReturnRequestDto: CreateReturnRequestDto) {
    return await this.returnRequestsService.create(createReturnRequestDto);
  }

  @ApiOperation({ summary: 'Get all return requests' })
  @ApiResponse({
    status: 200,
    description: 'Get all return requests',
    type: [ReturnRequestEntity],
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
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @Get()
  async findAll(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return await this.returnRequestsService.findAll(
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Get one return request' })
  @ApiResponse({
    status: 200,
    description: 'Get one return request',
    type: ReturnRequestEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN', 'OPERATOR')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.returnRequestsService.findOne(+id);
  }

  @ApiOperation({
    summary: 'Update return request status (staff only)',
    description:
      'Updates return request status following a mandatory two-step workflow: PENDING → IN_PROGRESS → APPROVED/REJECTED. ' +
      'When current status is PENDING, must transition to IN_PROGRESS first (review step). ' +
      'When current status is IN_PROGRESS, must transition to APPROVED or REJECTED (final decision). ' +
      'Cannot update to the same status or revert to PENDING. ' +
      'Requires staff role (ADMIN or OPERATOR). DB-only operation; does not call external refund APIs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return request status updated successfully',
    type: ReturnRequestEntity,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid status transition (e.g., PENDING→APPROVED, IN_PROGRESS→IN_PROGRESS), ' +
      'invalid target status, request is not a return request type, or current status is not PENDING/IN_PROGRESS',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - return request not found by ID',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @ApiBody({
    type: UpdateReturnRequestDto,
    description:
      'Status update payload with processByStaffId (staff member ID) and status (target: APPROVED, REJECTED, or IN_PROGRESS). ' +
      'PENDING requests must set status=IN_PROGRESS. IN_PROGRESS requests must set status=APPROVED or REJECTED.',
  })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateReturnRequestDto: UpdateReturnRequestDto,
  ) {
    return await this.returnRequestsService.update(+id, updateReturnRequestDto);
  }
  @ApiOperation({
    summary: 'Update return request details (user only)',
    description:
      'Allows a user to update their own PENDING return request details. ' +
      'Users can modify bank account information and description ONLY if the request status is PENDING. ' +
      'Once staff marks the request as IN_PROGRESS or makes a final decision (APPROVED/REJECTED), no further user edits are allowed. ' +
      'Bank information must be provided completely (all three fields: bankName, bankAccountNumber, bankAccountName) or not at all (all-or-nothing). ' +
      'Partial bank updates are not permitted.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return request details updated successfully',
    type: ReturnRequestEntity,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Request status is not PENDING, partial bank information provided, ' +
      'request does not belong to user, or invalid request type',
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found - return request not found or associated order not found',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @ApiBody({
    type: UserUpdateReturnRequestDto,
    description:
      'Update payload with optional bank info (all-or-nothing) and description. ' +
      'bankName, bankAccountNumber, bankAccountName must all be provided together or all omitted. ' +
      'Request must be in PENDING status to update.',
  })
  @Patch('/:id/user-edit')
  async userUpdateReturnRequest(
    @Param('id') id: string,
    @Body() userUpdateReturnRequestDto: UserUpdateReturnRequestDto,
    @Request() req: RequestWithUserInJWTStrategy,
  ) {
    return await this.returnRequestsService.userUpdateReturnRequest(
      +id,
      BigInt(req.user.userId),
      userUpdateReturnRequestDto,
    );
  }
  @ApiOperation({ summary: 'Delete one return request' })
  @ApiResponse({
    status: 200,
    description: 'Delete one return request',
    type: ReturnRequestEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.returnRequestsService.remove(+id);
  }
}
