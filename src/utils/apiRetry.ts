import { logger } from '@core/services/LoggerService';
import { notify } from '@core/store';

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number) => void;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryCondition: (error) => {
    // Retry on network errors and 5xx server errors
    if (!error.response) return true; // Network error
    const status = error.response?.status || error.status;
    return status >= 500 && status < 600;
  },
  onRetry: (error, attempt) => {
    logger.warn(`API call failed, retrying (attempt ${attempt})`, { error });
  }
};

/**
 * Exponential backoff with jitter
 */
function getRetryDelay(attempt: number, config: Required<RetryConfig>): number {
  const exponentialDelay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  const delay = Math.min(exponentialDelay, config.maxDelay);
  // Add jitter to prevent thundering herd
  const jitter = delay * 0.1 * Math.random();
  return delay + jitter;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for async functions
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 1; attempt <= mergedConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt === mergedConfig.maxRetries || !mergedConfig.retryCondition(error)) {
        throw error;
      }

      // Call retry callback
      mergedConfig.onRetry(error, attempt);

      // Wait before retrying
      const delay = getRetryDelay(attempt, mergedConfig);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Create a retry wrapper with custom configuration
 */
export function createRetryWrapper(defaultConfig: RetryConfig = {}) {
  return <T>(fn: () => Promise<T>, config: RetryConfig = {}): Promise<T> => {
    return withRetry(fn, { ...defaultConfig, ...config });
  };
}

/**
 * React Query retry configuration
 */
export const reactQueryRetryConfig = {
  retry: (failureCount: number, error: any) => {
    // Don't retry on 4xx errors
    const status = error?.response?.status || error?.status;
    if (status >= 400 && status < 500) {
      return false;
    }
    // Retry up to 3 times
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => {
    // Exponential backoff with jitter
    const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
    const jitter = baseDelay * 0.1 * Math.random();
    return baseDelay + jitter;
  }
};

/**
 * Supabase-specific retry wrapper
 */
export async function supabaseWithRetry<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  try {
    const result = await withRetry(
      async () => {
        const { data, error } = await operation();
        if (error) {
          // Check if it's a retryable error
          if (error.code === 'PGRST301' || // Network error
              error.code === 'PGRST000' || // Timeout
              error.message?.includes('NetworkError') ||
              error.message?.includes('FetchError')) {
            throw error; // Will be caught and retried
          }
          // Non-retryable error, return as is
          return { data, error };
        }
        return { data, error: null };
      },
      {
        maxRetries: 3,
        retryCondition: (error) => {
          // Retry on specific Supabase errors
          return error.code === 'PGRST301' ||
                 error.code === 'PGRST000' ||
                 error.message?.includes('NetworkError') ||
                 error.message?.includes('FetchError');
        },
        onRetry: (error, attempt) => {
          logger.info(`Supabase operation failed, retrying (attempt ${attempt})`, {
            code: error.code,
            message: error.message
          });
        }
      }
    );
    return result;
  } catch (finalError) {
    return { data: null, error: finalError };
  }
}

/**
 * Fetch with retry
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  config?: RetryConfig
): Promise<Response> {
  return withRetry(
    async () => {
      const response = await fetch(url, options);
      
      // Throw error for server errors to trigger retry
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      return response;
    },
    {
      ...config,
      onRetry: (error, attempt) => {
        logger.warn(`Fetch failed for ${url}, retrying (attempt ${attempt})`, { error });
        if (attempt === 3) {
          notify.warning('Connection issues', 'Having trouble connecting to the server. Retrying...');
        }
      }
    }
  );
}

/**
 * Circuit breaker pattern for API calls
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime?: number;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  private threshold = 5;
  private timeout = 60000; // 1 minute
  private resetTimeout = 30000; // 30 seconds

  constructor(
    threshold = 5,
    timeout = 60000, // 1 minute
    resetTimeout = 30000 // 30 seconds
  ) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.resetTimeout = resetTimeout;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (this.lastFailureTime && now - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.reset();
    }
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      logger.error('Circuit breaker opened due to excessive failures', {
        failures: this.failures,
        threshold: this.threshold
      });
      notify.error('Service temporarily unavailable', 'Too many errors occurred. Please try again later.');
      
      // Auto-reset after timeout
      setTimeout(() => {
        this.state = 'HALF_OPEN';
        logger.info('Circuit breaker entering HALF_OPEN state');
      }, this.resetTimeout);
    }
  }

  private reset() {
    this.failures = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = undefined;
    logger.info('Circuit breaker reset to CLOSED state');
  }

  getState() {
    return this.state;
  }

  getFailures() {
    return this.failures;
  }
}