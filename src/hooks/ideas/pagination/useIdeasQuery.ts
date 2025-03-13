
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  fetchPaginatedIdeas, 
  NetworkError, 
  ServerError, 
  ValidationError 
} from '@/services/facelessIdeas/paginatedService';
import { FacelessIdeaInfo } from '@/services/facelessIdeas';
import { IdeasPaginationOptions, RetryTypeCategory } from './types';

export function useIdeasQuery(
  options: IdeasPaginationOptions,
  currentPage: number,
  setIdeas: (ideas: FacelessIdeaInfo[]) => void,
  setTotalPages: (pages: number) => void,
  setTotalItems: (items: number) => void,
  setRetryType: (type: RetryTypeCategory) => void,
  retryCount: number,
  setRetryCount: (count: number) => void
) {
  const {
    pageSize = 12,
    retryLimit = 3,
    search = '',
    sortBy = 'label',
    sortOrder = 'asc',
    filter = {},
    useCache = true,
    cacheTTL,
    retryDelay = 1500
  } = options;
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
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
  const query = useQuery({
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
      // Get the retry type that was set in the queryFn
      const baseDelay = retryDelay * Math.pow(1.5, attempt);
        
      // Add some jitter to prevent thundering herd problem
      return baseDelay * (0.8 + Math.random() * 0.4);
    }
  });

  // Update local state when data changes
  useEffect(() => {
    if (query.data) {
      setIdeas(query.data.data);
      setTotalPages(query.data.totalPages);
      setTotalItems(query.data.count);
    }
  }, [query.data, setIdeas, setTotalPages, setTotalItems]);
  
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
    if (query.isRefetching) {
      setRetryCount(prev => prev + 1);
      
      // Show toast on retry
      toast.info(`Retrying... (Attempt ${retryCount + 1}/${retryLimit})`, {
        id: 'retry-toast',
        duration: 2000
      });
    }
  }, [query.isRefetching, retryLimit, retryCount, setRetryCount]);

  return {
    ...query,
    queryKey
  };
}
