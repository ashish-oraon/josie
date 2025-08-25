import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { logger } from '../utils/logger.util';
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private isDevelopment = !environment.production;

  log(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      logger.log(message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      logger.warn(message, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      logger.error(message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      logger.info(message, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      logger.debug(message, ...args);
    }
  }

  // Method to check if logging is enabled
  isLoggingEnabled(): boolean {
    return this.isDevelopment;
  }

  // Method to force log in production (for critical errors)
  forceLog(message: string, ...args: any[]): void {
    logger.log(message, ...args);
  }

  // Method to force error in production (for critical errors)
  forceError(message: string, ...args: any[]): void {
    logger.error(message, ...args);
  }
}
