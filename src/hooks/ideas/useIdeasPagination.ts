
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { FacelessIdeaInfo } from '@/services/facelessIdeas';

interface UseIdeasPaginationOptions {
  pageSize?: number;
  initialPage?: number;
  retryLimit?: number;
  retryDelay?: number; // in ms
}

export function useIdeasPagination({
  pageSize = 12,
  initialPage = 1,
  retryLimit = 3,
  retryDelay = 1500
}: UseIdeasPaginationOptions = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [ideas, setIdeas] = useState<FacelessIdeaInfo[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [retryType, setRetryType] = useState<'network' | 'server' | 'unknown'>('unknown');

  // Handler for changing page
  const handlePageChange = useCallback((page: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  }, []);

  // Reset pagination
  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setRetryCount(0);
  }, [initialPage]);

  // Smart retry logic based on error type
  const smartRetry = useCallback(async (fetcher: () => Promise<any>) => {
    setIsLoading(true);
    
    try {
      const result = await fetcher();
      setRetryCount(0); // Reset retry count on success
      setError(null);
      return result;
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching ideas:', error);
      
      // Determine error type
      let errorType: 'network' | 'server' | 'unknown' = 'unknown';
      
      if (error.message.includes('network') || 
          error.message.includes('fetch') || 
          error.message.includes('timeout') ||
          error.message.includes('CORS')) {
        errorType = 'network';
      } else if (error.message.includes('500') || 
                error.message.includes('server')) {
        errorType = 'server';
      }
      
      setRetryType(errorType);
      setError(error);
      
      // Different retry strategies based on error type
      if (retryCount < retryLimit) {
        const nextRetryDelay = errorType === 'network' 
          ? retryDelay * Math.pow(1.5, retryCount) // Exponential backoff for network errors
          : retryDelay; // Constant delay for server errors
          
        toast.info(`Retrying in ${Math.round(nextRetryDelay/1000)} seconds... (Attempt ${retryCount + 1}/${retryLimit})`);
        
        setRetryCount(prev => prev + 1);
        
        // Set a timer to retry
        setTimeout(() => {
          smartRetry(fetcher);
        }, nextRetryDelay);
      } else {
        setIsLoading(false);
        toast.error(`Failed after ${retryLimit} attempts. Please try again later.`);
      }
      
      throw error;
    }
  }, [retryCount, retryLimit, retryDelay]);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    totalItems, 
    setTotalItems,
    isLoading,
    setIsLoading,
    error,
    setError,
    ideas,
    setIdeas,
    retryCount,
    retryType,
    handlePageChange,
    resetPagination,
    pageSize,
    smartRetry
  };
}
