
import { useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  fetchPaginatedIdeas, 
  NetworkError, 
  ServerError, 
  ValidationError 
} from '@/services/facelessIdeas/pagination/fetchService';
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
  
  // Use stable query keys for better cache management and performance
  const queryKey = useMemo(() => [
    'facelessIdeas', 
    currentPage, 
    pageSize, 
    search, 
    sortBy, 
    sortOrder,
    // Generate a stable key from the filter object
    JSON.stringify(filter)
  ], [currentPage, pageSize, search, sortBy, sortOrder, filter]);
  
  // Use React Query for data fetching with optimized caching
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        // Create abort controller for this request
        abortControllerRef.current = new AbortController();
        
        // Track start time for performance monitoring
        const startTime = performance.now();
        
        // Only refresh count on page 1 or explicit force - better performance
        const forceCountRefresh = currentPage === 1 || retryCount > 0;
        
        const result = await fetchPaginatedIdeas({
          page: currentPage,
          pageSize,
          search,
          sortBy,
          sortOrder,
          filter,
          useCache,
          cacheTTL,
          forceCountRefresh
        });
        
        // Log performance metrics
        const fetchTime = performance.now() - startTime;
        console.log(
          `Ideas fetch completed in ${fetchTime.toFixed(2)}ms, ` +
          `execution time: ${result.executionTime?.toFixed(2) || 'unknown'}ms, ` +
          `from cache: ${result.fromCache ? 'yes' : 'no'}`
        );
        
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
    gcTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes for better performance
    retry: (failureCount, error) => {
      // Don't retry for validation errors
      if (error instanceof ValidationError) {
        return false;
      }
      
      // For other errors, retry based on retry limit
      return failureCount < retryLimit;
    },
    retryDelay: (attempt) => {
      // Exponential backoff with jitter to prevent thundering herd problem
      const baseDelay = retryDelay * Math.pow(1.5, attempt);
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
      // Update retry count directly
      setRetryCount(retryCount + 1);
      
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
