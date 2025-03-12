
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { FacelessIdeaInfo } from '@/services/facelessIdeas';
import { 
  fetchPaginatedIdeas, 
  NetworkError, 
  ServerError, 
  ValidationError,
  retryWithBackoff
} from '@/services/facelessIdeas/paginatedService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface UseIdeasPaginationOptions {
  pageSize?: number;
  initialPage?: number;
  retryLimit?: number;
  retryDelay?: number; // in ms
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
  useCache?: boolean;
  cacheTTL?: number;
}

export function useIdeasPagination({
  pageSize = 12,
  initialPage = 1,
  retryLimit = 3,
  retryDelay = 1500,
  search = '',
  sortBy = 'label',
  sortOrder = 'asc',
  filter = {},
  useCache = true,
  cacheTTL
}: UseIdeasPaginationOptions = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [ideas, setIdeas] = useState<FacelessIdeaInfo[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [retryType, setRetryType] = useState<'network' | 'server' | 'validation' | 'unknown'>('unknown');
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();
  
  // Create a unique query key based on all pagination parameters
  const queryKey = [
    'facelessIdeas', 
    currentPage, 
    pageSize, 
    search, 
    sortBy, 
    sortOrder,
    // Convert filter object to string for stable query key
    JSON.stringify(filter)
  ];
  
  // Use React Query for data fetching with automatic caching
  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
    dataUpdatedAt,
    isFetching
  } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        // Create abort controller for this request
        abortControllerRef.current = new AbortController();
        
        // Track start time for performance monitoring
        const startTime = performance.now();
        
        const result = await fetchPaginatedIdeas({
          page: currentPage,
          pageSize,
          search,
          sortBy,
          sortOrder,
          filter,
          useCache,
          cacheTTL
        });
        
        // Log performance metrics
        const fetchTime = performance.now() - startTime;
        console.log(`Ideas fetch completed in ${fetchTime.toFixed(2)}ms, execution time: ${result.executionTime?.toFixed(2) || 'unknown'}ms`);
        
        return result;
      } catch (err) {
        // Identify error type and set retry type accordingly
        if (err instanceof NetworkError) {
          setRetryType('network');
        } else if (err instanceof ServerError) {
          setRetryType('server');
        } else if (err instanceof ValidationError) {
          setRetryType('validation');
        } else {
          setRetryType('unknown');
        }
        
        throw err;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: useCache ? cacheTTL || 5 * 60 * 1000 : 0, // Use the provided TTL or 5 minutes
    retry: (failureCount, error) => {
      // Don't retry for validation errors
      if (error instanceof ValidationError) {
        return false;
      }
      
      // For other errors, retry based on retry limit
      return failureCount < retryLimit;
    },
    retryDelay: (attempt) => {
      // Different retry strategies based on error type
      const baseDelay = retryType === 'network' 
        ? retryDelay * Math.pow(1.5, attempt) // Exponential backoff for network errors
        : retryDelay; // Constant delay for other errors
        
      // Add some jitter to prevent thundering herd problem
      return baseDelay * (0.8 + Math.random() * 0.4);
    },
    meta: {
      errorType: retryType
    }
  });
  
  // Update local state when data changes
  useEffect(() => {
    if (data) {
      setIdeas(data.data);
      setTotalPages(data.totalPages);
      setTotalItems(data.count);
    }
  }, [data]);
  
  // Clean up abort controller on unmount and query change
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [queryKey.join()]);
  
  // Track retry count
  useEffect(() => {
    if (isRefetching) {
      setRetryCount(prev => prev + 1);
      
      // Show toast on retry
      toast.info(`Retrying... (Attempt ${retryCount + 1}/${retryLimit})`, {
        id: 'retry-toast',
        duration: 2000
      });
    }
  }, [isRefetching, retryLimit]);
  
  // Handler for changing page
  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage) return;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  }, [currentPage]);

  // Reset pagination
  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setRetryCount(0);
  }, [initialPage]);
  
  // Force refresh data with optional cache busting
  const refreshData = useCallback((bustCache: boolean = false) => {
    if (bustCache) {
      // Invalidate cached data for this query
      queryClient.invalidateQueries({ queryKey: ['facelessIdeas'] });
    }
    
    // Reset retry count and refetch
    setRetryCount(0);
    refetch();
  }, [refetch, queryClient]);

  // Smart retry logic based on error type
  const smartRetry = useCallback(async (fetcher: () => Promise<any>) => {
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
      let errorType: 'network' | 'server' | 'validation' | 'unknown' = 'unknown';
      
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
  }, [retryLimit, retryDelay]);

  return {
    // Pagination state
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems, 
    ideas,
    
    // Loading state
    isLoading: isLoading || isFetching,
    isFetching,
    error,
    
    // Retry state
    retryCount,
    retryType,
    
    // Event handlers
    handlePageChange,
    resetPagination,
    refreshData,
    smartRetry,
    
    // React Query data
    queryKey,
    rawQueryResponse: data,
    dataUpdatedAt,
    
    // Configuration
    pageSize,
  };
}
