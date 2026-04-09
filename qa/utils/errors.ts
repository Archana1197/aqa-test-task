/**
 * Custom error classes for better error handling
 * Follows Exception Handling best practices
 */

/**
 * Base test error class
 */
export class TestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Page navigation error
 */
export class NavigationError extends TestError {
  constructor(url: string, reason?: string) {
    super(`Failed to navigate to ${url}${reason ? `: ${reason}` : ''}`);
  }
}

/**
 * Element not found error
 */
export class ElementNotFoundError extends TestError {
  constructor(selector: string) {
    super(`Element not found: ${selector}`);
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends TestError {
  constructor(action: string, timeout: number) {
    super(`Timeout after ${timeout}ms while waiting for: ${action}`);
  }
}

/**
 * Assertion error
 */
export class AssertionError extends TestError {
  constructor(expected: any, actual: any, message?: string) {
    const errorMsg = message 
      ? `${message}\nExpected: ${expected}\nActual: ${actual}`
      : `Expected: ${expected}\nActual: ${actual}`;
    super(errorMsg);
  }
}
