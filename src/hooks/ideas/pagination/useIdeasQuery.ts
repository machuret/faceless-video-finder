import { useEffect, useRef, useMemo } from 'react';
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
  
  const queryKey = useMemo(() => [
    'facelessIdeas', 
    currentPage, 
    pageSize, 
    search, 
    sortBy, 
    sortOrder,
    JSON.stringify(filter)
  ], [currentPage, pageSize, search, sortBy, sortOrder, filter]);
  
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        abortControllerRef.current = new AbortController();
        
        const startTime = performance.now();
        
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
        
        const fetchTime = performance.now() - startTime;
        console.log(
          `Ideas fetch completed in ${fetchTime.toFixed(2)}ms, ` +
          `execution time: ${result.executionTime?.toFixed(2) || 'unknown'}ms, ` +
          `from cache: ${result.fromCache ? 'yes' : 'no'}`
        );
        
        return result;
      } catch (err) {
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
    staleTime: useCache ? cacheTTL || 5 * 60 * 1000 : 0,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ValidationError) {
        return false;
      }
      
      return failureCount < retryLimit;
    },
    retryDelay: (attempt) => {
      const baseDelay = retryDelay * Math.pow(1.5, attempt);
      return baseDelay * (0.8 + Math.random() * 0.4);
    }
  });

  useEffect(() => {
    if (query.data) {
      setIdeas(query.data.data);
      setTotalPages(query.data.totalPages);
      setTotalItems(query.data.count);
    }
  }, [query.data, setIdeas, setTotalPages, setTotalItems]);
  
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [queryKey.join()]);
  
  useEffect(() => {
    if (query.isRefetching) {
      setRetryCount(retryCount + 1);
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
