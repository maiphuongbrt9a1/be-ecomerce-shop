import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Returns a simple greeting message for API health check.
   *
   * This method performs the following operations:
   * 1. Returns static "Hello World!" string
   *
   * @returns {string} The greeting message "Hello World!"
   *
   * @remarks
   * - Used for basic API health check endpoint
   * - Confirms server is running and responding
   * - No database or external service dependencies
   */
  getHello(): string {
    return 'Hello World!';
  }
}
