import { environment } from '../../environments/environment';

const isDevelopment = !environment.production;

export const logger = {
  log: (message: string, ...args: any[]): void => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },

  warn: (message: string, ...args: any[]): void => {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
  },

  error: (message: string, ...args: any[]): void => {
    if (isDevelopment) {
      console.error(message, ...args);
    }
  },

  info: (message: string, ...args: any[]): void => {
    if (isDevelopment) {
      console.info(message, ...args);
    }
  },

  debug: (message: string, ...args: any[]): void => {
    if (isDevelopment) {
      console.debug(message, ...args);
    }
  },

  // Force log in production (for critical errors)
  forceLog: (message: string, ...args: any[]): void => {
    console.log(message, ...args);
  },

  // Force error in production (for critical errors)
  forceError: (message: string, ...args: any[]): void => {
    console.error(message, ...args);
  },

  // Check if logging is enabled
  isEnabled: (): boolean => isDevelopment
};
