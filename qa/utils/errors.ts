/**
 * Custom error classes for better error handling
 * Follows Exception Handling best practices
 * 
 * These error classes provide type-safe error handling for common test scenarios.
 * Currently unused but available for future implementation.
 */

/**
 * Base test error class
 * All custom test errors should extend this class
 * @param message - Error message
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
 * Thrown when page navigation fails
 * @param url - The URL that failed to navigate
 * @param reason - Optional reason for failure
 */
export class NavigationError extends TestError {
  constructor(url: string, reason?: string) {
    super(`Failed to navigate to ${url}${reason ? `: ${reason}` : ''}`);
  }
}

/**
 * Element not found error
 * Thrown when an element cannot be located
 * @param selector - The selector that failed to find the element
 */
export class ElementNotFoundError extends TestError {
  constructor(selector: string) {
    super(`Element not found: ${selector}`);
  }
}

/**
 * Timeout error
 * Thrown when an operation exceeds its timeout
 * @param action - Description of the action that timed out
 * @param timeout - Timeout duration in milliseconds
 */
export class TimeoutError extends TestError {
  constructor(action: string, timeout: number) {
    super(`Timeout after ${timeout}ms while waiting for: ${action}`);
  }
}

/**
 * Assertion error
 * Thrown when a test assertion fails
 * @param expected - Expected value
 * @param actual - Actual value received
 * @param message - Optional additional context
 */
export class AssertionError extends TestError {
  constructor(expected: unknown, actual: unknown, message?: string) {
    const errorMsg = message 
      ? `${message}\nExpected: ${expected}\nActual: ${actual}`
      : `Expected: ${expected}\nActual: ${actual}`;
    super(errorMsg);
  }
}
