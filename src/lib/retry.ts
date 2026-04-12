/**
 * Retry with exponential backoff for network requests.
 */
import { logger } from './logger';

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;  // ms
  maxDelay?: number;   // ms
  label?: string;      // for logging
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxRetries = 3, baseDelay = 500, maxDelay = 5000, label = 'request' } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
        logger.warn(`Retry ${attempt + 1}/${maxRetries} for ${label}`, {
          delay,
          error: error instanceof Error ? error.message : String(error),
        });
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  logger.error(`All retries exhausted for ${label}`, {
    maxRetries,
    error: lastError instanceof Error ? lastError.message : String(lastError),
  });

  throw lastError;
}
