import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { reactQueryRetryConfig } from '@utils/apiRetry';

// Create a client with optimized defaults and retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long until a query is considered stale
      staleTime: 1 * 60 * 1000, // 1 minute
      
      // Cache time: how long to keep unused data in cache
      gcTime: 5 * 60 * 1000, // 5 minutes
      
      // Enhanced retry configuration with exponential backoff
      retry: reactQueryRetryConfig.retry,
      retryDelay: reactQueryRetryConfig.retryDelay,
      
      // Refetch on window focus
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Enhanced retry configuration for mutations
      retry: reactQueryRetryConfig.retry,
      retryDelay: reactQueryRetryConfig.retryDelay,
      
      // Network mode
      networkMode: 'online',
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}