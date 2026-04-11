/**
 * Error handling utilities for test logging
 * Provides type-safe error message extraction and validation
 */

/**
 * Get error message from unknown error type
 * @param error - Unknown error object
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Check if error message contains specific text
 * @param error - Unknown error object
 * @param text - Text to search for
 * @returns True if error message contains the text
 */
export function errorIncludes(error: unknown, text: string): boolean {
  if (error instanceof Error) {
    return error.message.includes(text);
  }
  return String(error).includes(text);
}
