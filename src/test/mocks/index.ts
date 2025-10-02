import { vi } from 'vitest';

// Export all mock utilities
export * from './supabase';

// Common test utilities
export const createMockFunction = <T extends (...args: any[]) => any>(
  returnValue?: ReturnType<T>
) => {
  const fn = vi.fn();
  if (returnValue !== undefined) {
    fn.mockReturnValue(returnValue);
  }
  return fn as unknown as T;
};

export const createAsyncMockFunction = <T extends (...args: any[]) => Promise<any>>(
  resolveValue?: Awaited<ReturnType<T>>,
  rejectValue?: any
) => {
  const fn = vi.fn();
  if (rejectValue) {
    fn.mockRejectedValue(rejectValue);
  } else if (resolveValue !== undefined) {
    fn.mockResolvedValue(resolveValue);
  }
  return fn as unknown as T;
};