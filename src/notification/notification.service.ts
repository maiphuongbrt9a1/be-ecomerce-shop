import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { Notification, NotificationType, Prisma, Role } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class NotificationService {
  /**
   * Creates notification service instance.
   *
   * This constructor performs the following operations:
   * 1. Injects Prisma service for notification persistence
   * 2. Injects notification gateway for realtime emission
   *
   * @param {PrismaService} prismaService - Prisma database service
   * @param {NotificationGateway} notificationGateway - Notification websocket gateway
   */
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}
  private readonly logger = new Logger(NotificationService.name);

  /**
   * Re-throws known HTTP exceptions to preserve domain error semantics.
   *
   * This method performs the following operations:
   * 1. Checks whether caught error is an HttpException
   * 2. Re-throws known HTTP errors unchanged
   * 3. Allows unknown errors to be wrapped by caller
   *
   * @param {unknown} error - Caught error from try/catch block
   *
   * @returns {void} No return value
   *
   * @throws {HttpException} If provided error is an HttpException
   */
  private rethrowIfHttpException(error: unknown): void {
    if (error instanceof HttpException) {
      throw error;
    }
  }

  /**
   * Sends a personal notification to one recipient.
   *
   * This method performs the following operations:
   * 1. Validates recipient user existence
   * 2. Creates PERSONAL_NOTIFICATION record in database
   * 3. Emits realtime payload to recipient notification room
   *
   * @param {number} receiverId - Recipient user id
   * @param {string} title - Notification title
   * @param {string} content - Notification content
   *
   * @returns {Promise<Notification>} Created personal notification record
   *
   * @throws {NotFoundException} If recipient user is not found
   * @throws {BadRequestException} If send operation fails
   */
  async sendNotificationToUser(
    receiverId: number,
    title: string,
    content: string,
  ): Promise<Notification> {
    try {
      // check if recipient user exists
      const recipient = await this.prismaService.user.findUnique({
        where: {
          id: BigInt(receiverId),
        },
      });

      if (!recipient) {
        this.logger.error(
          `Recipient user with id ${receiverId} not found, cannot send notification`,
        );
        throw new NotFoundException(
          `Recipient user with id ${receiverId} not found`,
        );
      }

      // create personal notification record in database

      const newPersonalNotification =
        await this.prismaService.notification.create({
          data: {
            title: title,
            content: content,
            recipientId: BigInt(receiverId),
            type: NotificationType.PERSONAL_NOTIFICATION,
          },
        });

      this.logger.log(
        `Personal notification created with id ${newPersonalNotification.id} for recipient user id ${receiverId}`,
      );

      const emitted =
        this.notificationGateway.emitPersonalNotificationToUserRoom(
          receiverId,
          {
            receiverId: receiverId,
            receiverEmail: recipient.email,
            title,
            content,
          },
        );

      if (!emitted) {
        this.logger.error(
          `Failed to emit personal notification to user room for user id ${receiverId}`,
        );
      } else {
        this.logger.log(
          `Realtime personal notification emitted to user room for user id ${receiverId}`,
        );
      }

      return newPersonalNotification;
    } catch (error) {
      this.logger.error('Error sending notification to user', error);
      this.rethrowIfHttpException(error);
      throw new BadRequestException('Failed to send notification to user');
    }
  }

  /**
   * Sends a shop notification to all users.
   *
   * This method performs the following operations:
   * 1. Validates sender user existence
   * 2. Validates sender role permission (ADMIN or OPERATOR)
   * 3. Creates SHOP_NOTIFICATION record and emits to global room
   *
   * @param {number} senderId - Sender user id
   * @param {string} title - Notification title
   * @param {string} content - Notification content
   *
   * @returns {Promise<Notification>} Created shop notification record
   *
   * @throws {NotFoundException} If sender user is not found
   * @throws {BadRequestException} If sender is unauthorized or operation fails
   */
  async sendNotificationToAllUsers(
    senderId: number,
    title: string,
    content: string,
  ): Promise<Notification> {
    try {
      // check if sender user exists and have permission to send shop notification
      const sender = await this.prismaService.user.findUnique({
        where: {
          id: BigInt(senderId),
        },
      });

      if (!sender) {
        this.logger.error(
          `Sender user with id ${senderId} not found, cannot send notification to all users`,
        );
        throw new NotFoundException(
          `Sender user with id ${senderId} not found`,
        );
      }

      if (sender.role !== Role.ADMIN && sender.role !== Role.OPERATOR) {
        this.logger.error(
          `User with id ${senderId} does not have permission to send shop notifications`,
        );
        throw new BadRequestException(
          `User with id ${senderId} does not have permission to send shop notifications`,
        );
      }

      // create shop notification record in database

      const newShopNotification = await this.prismaService.notification.create({
        data: {
          title: title,
          content: content,
          creatorId: BigInt(senderId),
          type: NotificationType.SHOP_NOTIFICATION,
        },
      });

      this.logger.log(
        `Shop notification created with id ${newShopNotification.id} by sender user id ${senderId}`,
      );

      // emit the notification to all users in shop notification room
      const emitted = this.notificationGateway.emitShopNotificationToAllUsers({
        creatorId: senderId,
        creatorEmail: sender.email,
        title: title,
        content: content,
      });

      if (!emitted) {
        this.logger.error(
          `Failed to emit shop notification to all users by sender user id ${senderId}`,
        );
      } else {
        this.logger.log(
          `Realtime shop notification emitted to all users by sender user id ${senderId}`,
        );
      }

      return newShopNotification;
    } catch (error) {
      this.logger.error('Error sending notification to all users', error);
      this.rethrowIfHttpException(error);
      throw new BadRequestException('Failed to send notification to all users');
    }
  }

  /**
   * Retrieves notifications visible to a specific user with pagination.
   *
   * This method performs the following operations:
   * 1. Builds paginator with requested page size
   * 2. Queries personal notifications for user and global shop notifications
   * 3. Returns paginated data ordered by newest first
   *
   * @param {number} userId - Target user id
   * @param {number} page - Page number (1-based)
   * @param {number} perPage - Number of notifications per page
   *
   * @returns {Promise<Notification[]>} Notification list for requested page
   *
   * @throws {BadRequestException} If fetch operation fails
   */
  async getAllNotificationsForUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Notification[]> {
    try {
      const paginate = createPaginator({ perPage: perPage });

      const result = await paginate<
        Notification,
        Prisma.NotificationFindManyArgs
      >(
        this.prismaService.notification,
        {
          where: {
            OR: [
              { recipientId: BigInt(userId) }, // personal notifications for the user
              { type: NotificationType.SHOP_NOTIFICATION }, // shop notifications for all users
            ],
          },
          orderBy: { createdAt: 'desc' },
        },
        { page: page },
      );

      this.logger.log(
        `Fetched notifications for user id ${userId} - page ${page}, perPage ${perPage}`,
      );

      return result.data;
    } catch (error) {
      this.logger.error('Error fetching notifications for user', error);
      throw new BadRequestException('Failed to fetch notifications for user');
    }
  }

  /**
   * Marks a personal notification as read by recipient user.
   *
   * This method performs the following operations:
   * 1. Validates notification existence
   * 2. Verifies notification ownership by recipient user
   * 3. Updates notification read status to true
   *
   * @param {number} notificationId - Notification id to update
   * @param {number} userId - User id requesting status update
   *
   * @returns {Promise<Notification>} Updated notification record
   *
   * @throws {NotFoundException} If notification is not found
   * @throws {BadRequestException} If user is unauthorized or update fails
   */
  async updatePersonalNotificationStatus(
    notificationId: number,
    userId: number,
  ): Promise<Notification> {
    try {
      const notification = await this.prismaService.notification.findUnique({
        where: {
          id: BigInt(notificationId),
        },
      });

      if (!notification) {
        this.logger.error(
          `Notification with id ${notificationId} not found, cannot update status`,
        );
        throw new NotFoundException('Notification not found');
      }

      if (notification.type !== NotificationType.PERSONAL_NOTIFICATION) {
        this.logger.error(
          `Notification with id ${notificationId} is not a personal notification, cannot update status`,
        );
        throw new BadRequestException(
          'Only personal notifications can be updated. The Shop notifications are read-only and cannot be marked as read.',
        );
      }

      if (notification.recipientId !== BigInt(userId)) {
        this.logger.error(
          `User with id ${userId} do not receive the notification id ${notificationId}, cannot update status`,
        );
        throw new BadRequestException(
          `User with id ${userId} do not receive the notification id ${notificationId}, cannot update status`,
        );
      }

      const updatePersonalNotification =
        await this.prismaService.notification.update({
          where: {
            id: BigInt(notificationId),
          },
          data: {
            isRead: true,
          },
        });

      this.logger.log(
        `Personal notification with id ${notificationId} marked as read by user id ${userId}`,
      );

      return updatePersonalNotification;
    } catch (error) {
      this.logger.error('Error updating personal notification status', error);
      this.rethrowIfHttpException(error);
      throw new BadRequestException(
        'Failed to update personal notification status',
      );
    }
  }
}
