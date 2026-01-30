import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService manages the Prisma database connection lifecycle.
 *
 * This service extends PrismaClient and implements NestJS lifecycle hooks
 * to properly manage database connections during application startup and shutdown.
 *
 * @remarks
 * - Automatically connects to database on module initialization
 * - Automatically disconnects from database on module destruction
 * - Provides Prisma Client instance for all database operations
 * - Injectable service available throughout the application
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Establishes database connection when the NestJS module initializes.
   *
   * This method performs the following operations:
   * 1. Connects to database using Prisma Client
   *
   * @returns {Promise<void>} Resolves when connection is established
   *
   * @remarks
   * - Called automatically by NestJS during module initialization
   * - Ensures database is ready before handling requests
   */
  async onModuleInit() {
    await this.$connect();
  }
  /**
   * Closes database connection when the NestJS module is destroyed.
   *
   * This method performs the following operations:
   * 1. Disconnects from database using Prisma Client
   *
   * @returns {Promise<void>} Resolves when connection is closed
   *
   * @remarks
   * - Called automatically by NestJS during graceful shutdown
   * - Ensures proper cleanup of database connections
   * - Prevents connection leaks during application shutdown
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
