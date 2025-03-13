
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { 
  NetworkError, 
  ServerError, 
  ValidationError,
  retryWithBackoff
} from '@/services/facelessIdeas/paginatedService';
import { RetryTypeCategory } from './types';

export function usePaginationHandlers(
  currentPage: number,
  setCurrentPage: (page: number) => void,
  setRetryCount: (count: number) => void,
  setRetryType: (type: RetryTypeCategory) => void,
  initialPage: number,
  retryLimit: number,
  retryDelay: number,
  refetch: () => void
) {
  const queryClient = useQueryClient();
  
  // Handler for changing page
  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage) return;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  }, [currentPage, setCurrentPage]);

  // Reset pagination
  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setRetryCount(0);
  }, [initialPage, setCurrentPage, setRetryCount]);
  
  // Force refresh data with optional cache busting
  const refreshData = useCallback((bustCache: boolean = false) => {
    if (bustCache) {
      // Invalidate cached data for this query
      queryClient.invalidateQueries({ queryKey: ['facelessIdeas'] });
    }
    
    // Reset retry count and refetch
    setRetryCount(0);
    refetch();
  }, [refetch, queryClient, setRetryCount]);

  // Smart retry logic based on error type
  const smartRetry = useCallback(async <T>(fetcher: () => Promise<T>): Promise<T> => {
    try {
      const result = await retryWithBackoff(fetcher, {
        maxRetries: retryLimit,
        initialDelay: retryDelay,
        errorFilter: (error) => {
          // Don't retry on validation errors
          return !(error instanceof ValidationError);
        }
      });
      
      setRetryCount(0); // Reset retry count on success
      return result;
    } catch (err) {
      const error = err as Error;
      console.error('Error executing operation:', error);
      
      // Determine error type
      let errorType: RetryTypeCategory = 'unknown';
      
      if (error instanceof NetworkError) {
        errorType = 'network';
      } else if (error instanceof ServerError) {
        errorType = 'server';
      } else if (error instanceof ValidationError) {
        errorType = 'validation';
      } else if (error.message.includes('network') || 
          error.message.includes('fetch') || 
          error.message.includes('timeout') ||
          error.message.includes('CORS')) {
        errorType = 'network';
      } else if (error.message.includes('500') || 
                error.message.includes('server')) {
        errorType = 'server';
      }
      
      setRetryType(errorType);
      
      // Different toast messages based on error type
      if (errorType === 'validation') {
        toast.error(`Invalid input: ${error.message}`);
      } else if (errorType === 'network') {
        toast.error(`Network issue: ${error.message}`);
      } else if (errorType === 'server') {
        toast.error(`Server error: ${error.message}`);
      } else {
        toast.error(`Error: ${error.message}`);
      }
      
      throw error;
    }
  }, [retryLimit, retryDelay, setRetryCount, setRetryType]);

  return {
    handlePageChange,
    resetPagination,
    refreshData,
    smartRetry
  };
}
