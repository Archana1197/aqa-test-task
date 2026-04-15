/**
 * API retry utilities
 * Handles retry logic with exponential backoff for API requests
 */

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  maxDelayMs: number;
  jitterRatio: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 7,
  retryDelay: 2000,
  maxDelayMs: 45000,
  jitterRatio: 0.3,
};

/**
 * Wait for specified milliseconds
 * @param ms - Milliseconds to wait
 */
async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for API calls with backoff
 * Retries on 429 (rate limit) errors with configurable delay
 * 
 * @param fn - Async function to retry
 * @param config - Retry configuration (optional)
 * @returns Result from the function
 * @throws Last error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const is429 = lastError.message?.includes('429');
      const isTransient5xx = /\b50[0-9]\b/.test(lastError.message ?? '');
      const isNetworkError =
        /ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|fetch failed/i.test(lastError.message ?? '');
      const isRetryable = is429 || isTransient5xx || isNetworkError;
      const isLastAttempt = attempt === config.maxRetries;
      
      if (isRetryable && !isLastAttempt) {
        const exponentialDelay = config.retryDelay * Math.pow(2, attempt);
        const boundedDelay = Math.min(exponentialDelay, config.maxDelayMs);
        const jitter = boundedDelay * config.jitterRatio * Math.random();
        const backoffDelay = Math.round(boundedDelay + jitter);
        console.log(
          `Retryable API error, waiting ${backoffDelay / 1000} seconds before retry... ` +
          `(attempt ${attempt + 1}/${config.maxRetries + 1})`
        );
        await wait(backoffDelay);
        continue;
      }
      throw error;
    }
  }
  
  throw lastError!;
}
