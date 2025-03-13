
import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { IdeasPaginationOptions, UseIdeasPaginationReturn } from './pagination/types';
import { usePaginationState } from './pagination/usePaginationState';
import { usePaginationHandlers } from './pagination/usePaginationHandlers';
import { useIdeasQuery } from './pagination/useIdeasQuery';
import { useDebounce } from '@/utils/hooks/useDebounce';

export function useIdeasPagination(options: IdeasPaginationOptions = {}): UseIdeasPaginationReturn {
  const queryClient = useQueryClient();
  
  // Extract options with defaults
  const {
    pageSize = 12,
    initialPage = 1,
    retryLimit = 3,
    retryDelay = 1500,
    search: rawSearch = '',
    sortBy = 'label',
    sortOrder = 'asc',
    filter: rawFilter = {},
    useCache = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
  } = options;
  
  // Debounce search to prevent excessive API calls
  const search = useDebounce(rawSearch, 300);
  
  // Memoize filter to prevent unnecessary re-renders
  const filter = useMemo(() => rawFilter, [JSON.stringify(rawFilter)]);
  
  // Use pagination state hook
  const {
    currentPage, setCurrentPage,
    totalPages, setTotalPages,
    totalItems, setTotalItems,
    ideas, setIdeas,
    retryCount, setRetryCount,
    retryType, setRetryType
  } = usePaginationState(initialPage);
  
  // Use ideas query hook with React Query
  const query = useIdeasQuery(
    {
      pageSize,
      retryLimit,
      retryDelay,
      search,
      sortBy,
      sortOrder,
      filter,
      useCache,
      cacheTTL
    },
    currentPage,
    setIdeas,
    setTotalPages,
    setTotalItems,
    setRetryType,
    retryCount,
    setRetryCount
  );
  
  // Use pagination handlers hook
  const {
    handlePageChange,
    resetPagination,
    refreshData,
    smartRetry
  } = usePaginationHandlers(
    currentPage,
    setCurrentPage,
    setRetryCount,
    setRetryType,
    initialPage,
    retryLimit,
    retryDelay,
    query.refetch
  );
  
  // Enhanced busting of cache for the specific entity
  const invalidateIdeasCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['facelessIdeas'] });
  }, [queryClient]);
  
  // Enhanced prefetch functionality for better UX
  const prefetchNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const nextPageQueryKey = [
        'facelessIdeas', 
        currentPage + 1, 
        pageSize, 
        search, 
        sortBy, 
        sortOrder,
        JSON.stringify(filter)
      ];
      
      queryClient.prefetchQuery({
        queryKey: nextPageQueryKey,
        queryFn: () => fetchPaginatedIdeas({
          page: currentPage + 1,
          pageSize,
          search,
          sortBy,
          sortOrder,
          filter,
          useCache,
          cacheTTL
        })
      });
    }
  }, [currentPage, totalPages, pageSize, search, sortBy, sortOrder, filter, queryClient, useCache, cacheTTL]);

  return {
    // Pagination state
    currentPage,
    totalPages,
    totalItems, 
    ideas,
    
    // Loading state
    isLoading: query.isLoading || query.isFetching,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    
    // Retry state
    retryCount,
    retryType,
    
    // Event handlers
    handlePageChange,
    resetPagination,
    refreshData,
    smartRetry,
    invalidateIdeasCache,
    prefetchNextPage,
    
    // React Query data
    queryKey: query.queryKey,
    rawQueryResponse: query.data,
    dataUpdatedAt: query.dataUpdatedAt,
    
    // Configuration
    pageSize,
  };
}
