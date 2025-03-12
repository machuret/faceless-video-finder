
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a singleton instance outside component to prevent recreation on rerenders
// This helps maintain cache between route changes
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Optimized caching strategy with longer cache lifetimes
        staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh (increased from default)
        gcTime: 30 * 60 * 1000, // 30 minutes - how long to keep inactive data in cache (increased)
        refetchOnWindowFocus: import.meta.env.PROD, // Only refetch on window focus in production
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

  // Error boundary for React Query
  try {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        {import.meta.env.DEV && 
          <ReactQueryDevtools 
            initialIsOpen={false}
            position="bottom"
          />
        }
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('React Query provider error:', error);
    // Fallback rendering without query features
    return <>{children}</>;
  }
}
