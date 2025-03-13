import { RetryOptions, RetryErrorFilter } from './types';

/**
 * Retry a function with exponential backoff and circuit breaker pattern
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2,
    errorFilter
  } = options;
  
  let attempt = 0;
  let lastError: any;
  
  const execute = async (): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;
      
      // Check if we should retry based on error type
      if (errorFilter && !errorFilter(error)) {
        console.log(`Error doesn't match filter criteria, not retrying.`);
        throw error;
      }
      
      // Check if we've exceeded max retries
      if (attempt > maxRetries) {
        console.log(`Maximum retries (${maxRetries}) exceeded.`);
        throw error;
      }
      
      // Calculate delay with exponential backoff and some randomization
      const delay = Math.min(
        initialDelay * Math.pow(factor, attempt - 1) * (1 + 0.2 * Math.random()),
        maxDelay
      );
      
      console.log(`Retry attempt ${attempt}/${maxRetries} after ${Math.round(delay)}ms...`);
      
      return new Promise((resolve) => {
        setTimeout(() => resolve(execute()), delay);
      });
    }
  };
  
  return execute();
};
