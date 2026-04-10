import { RedisService } from '@/helpers/redis.service';

export class UtilsService {
  /**
   * set user id on redis => key: user.id,  value: socketId
   * @param redisService
   * @param userId
   * @param socketId
   */
  static async setUserIdAndSocketIdOnRedis(
    redisService: RedisService,
    userId: string,
    socketId: string,
  ) {
    await redisService.getClient().set(`users:${userId}`, socketId);
  }
}
