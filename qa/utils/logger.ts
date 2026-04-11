/**
 * Logger utility for test execution
 * Provides structured logging with different levels
 * Follows Singleton Pattern
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {}

  /**
   * Get logger instance
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Log debug message
   */
  debug(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${this.formatMessage(message)}`, ...args);
    }
  }

  /**
   * Log info message
   */
  info(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.log(`[INFO] ${this.formatMessage(message)}`, ...args);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${this.formatMessage(message)}`, ...args);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, ...args: any[]): void {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(`[ERROR] ${this.formatMessage(message)}`, error, ...args);
    }
  }

  /**
   * Log step in test execution
   */
  step(stepName: string, stepNumber?: number): void {
    const prefix = stepNumber ? `Step ${stepNumber}` : 'Step';
    console.log(`\n=== ${prefix}: ${stepName} ===`);
  }

  /**
   * Log test result
   * @param passed - Whether the test passed
   * @param message - Result message
   */
  result(passed: boolean, message: string): void {
    const symbol = passed ? '✓' : '✗';
    const formattedMessage = `${symbol} ${message}`;
    
    if (passed) {
      console.log(formattedMessage);
    } else {
      console.error(formattedMessage);
    }
  }

  /**
   * Format message with timestamp
   * @param message - Message to format
   * @returns Formatted message with timestamp
   */
  private formatMessage(message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${message}`;
  }
}

/**
 * Exported logger instance for use across the application
 * Singleton pattern ensures consistent logging configuration
 */
export const logger = Logger.getInstance();
