import { HttpError } from './errors';

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  maxDelayMs: number;
  jitterRatio: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 7,
  retryDelay: 2000,
  maxDelayMs: 45000,
  jitterRatio: 0.3,
};

async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof HttpError) {
    return error.status === 429 || (error.status >= 500 && error.status < 600);
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message ?? '';
  return /ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|fetch failed/i.test(message);
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isRetryable = isRetryableError(error);
      const isLastAttempt = attempt === config.maxRetries;
      
      if (isRetryable && !isLastAttempt) {
        const exponentialDelay = config.retryDelay * Math.pow(2, attempt);
        const boundedDelay = Math.min(exponentialDelay, config.maxDelayMs);
        const jitter = boundedDelay * config.jitterRatio * Math.random();
        const backoffDelay = Math.round(boundedDelay + jitter);
        await wait(backoffDelay);
        continue;
      }
      throw error;
    }
  }
  
  throw lastError;
}
