import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import type { RequestWithUserInJWTStrategy } from '@/helpers/auth/interfaces/RequestWithUser.interface';
import { Notification } from '@prisma/client';
import { CreatePersonalNotificationDto } from './dto/create-personal-notification.dto';
import { CreateShopNotificationDto } from './dto/create-shop-notification.dto';

@Controller('notification')
@ApiTags('notification')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN', 'USER', 'OPERATOR')
export class NotificationController {
  /**
   * Creates notification controller instance.
   *
   * This constructor performs the following operations:
   * 1. Injects notification service dependency
   * 2. Prepares controller for notification route handling
   *
   * @param {NotificationService} notificationService - Notification business logic service
   */
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Send a personal notification to specific user' })
  @ApiResponse({
    status: 201,
    description: 'Personal notification is created and emitted',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBody({
    description: 'Personal notification payload',
    type: CreatePersonalNotificationDto,
  })
  @Post('/personal')
  async sendPersonalNotification(
    @Body() payload: CreatePersonalNotificationDto,
  ): Promise<Notification> {
    const notificationService: NotificationService = this.notificationService;
    return await notificationService.sendNotificationToUser(
      payload.recipientId,
      payload.title,
      payload.content,
    );
  }

  @ApiOperation({ summary: 'Send a shop notification to all users' })
  @ApiResponse({
    status: 201,
    description: 'Shop notification is created and emitted to all users',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBody({
    description: 'Shop notification payload',
    type: CreateShopNotificationDto,
  })
  @Post('/shop')
  async sendShopNotification(
    @Req() req: RequestWithUserInJWTStrategy,
    @Body() payload: CreateShopNotificationDto,
  ): Promise<Notification> {
    const notificationService: NotificationService = this.notificationService;
    return await notificationService.sendNotificationToAllUsers(
      Number(req.user.userId),
      payload.title,
      payload.content,
    );
  }

  @ApiOperation({
    summary: 'Get all notifications for authenticated user with pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Return notifications visible to authenticated user',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
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
    example: 20,
    description: 'Number of items per page',
  })
  @Get('/me')
  async getNotificationsForMe(
    @Req() req: RequestWithUserInJWTStrategy,
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
  ): Promise<Notification[]> {
    const notificationService: NotificationService = this.notificationService;
    return await notificationService.getAllNotificationsForUser(
      Number(req.user.userId),
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({
    summary: 'Mark personal notification as read for authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification read status updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiParam({
    name: 'notificationId',
    required: true,
    type: Number,
    example: 1001,
    description: 'Personal notification id to mark as read',
  })
  @Patch('/personal/:notificationId/read')
  async markPersonalNotificationAsRead(
    @Req() req: RequestWithUserInJWTStrategy,
    @Param('notificationId') notificationId: string,
  ): Promise<Notification> {
    const notificationService: NotificationService = this.notificationService;
    return await notificationService.updatePersonalNotificationStatus(
      Number(notificationId),
      Number(req.user.userId),
    );
  }
}
