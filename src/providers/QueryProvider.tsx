
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Custom error handler that can be globally modified
const defaultErrorHandler = (error: Error) => {
  console.error('Query error:', error);
};

// Create a singleton instance outside component to prevent recreation on rerenders
// This helps maintain cache between route changes
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Optimized caching strategy
        staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
        gcTime: 10 * 60 * 1000, // 10 minutes - how long to keep inactive data
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry on 404s or authorization errors
          if (
            error instanceof Error &&
            (error.message.includes('not found') || 
             error.message.includes('unauthorized') ||
             error.message.includes('forbidden'))
          ) {
            return false;
          }
          // Retry other errors twice
          return failureCount < 2;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
};

export function QueryProvider({ children }: { children: ReactNode }) {
  // Use lazy initialization to create the client only once
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV !== 'production' && 
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom-right"
        />
      }
    </QueryClientProvider>
  );
}
