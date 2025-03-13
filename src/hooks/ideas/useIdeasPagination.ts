
import { useCallback } from 'react';
import { IdeasPaginationOptions, UseIdeasPaginationReturn } from './pagination/types';
import { usePaginationState } from './pagination/usePaginationState';
import { usePaginationHandlers } from './pagination/usePaginationHandlers';
import { useIdeasQuery } from './pagination/useIdeasQuery';

export function useIdeasPagination(options: IdeasPaginationOptions = {}): UseIdeasPaginationReturn {
  const {
    pageSize = 12,
    initialPage = 1,
    retryLimit = 3,
    retryDelay = 1500,
  } = options;
  
  // Use pagination state hook
  const {
    currentPage, setCurrentPage,
    totalPages, setTotalPages,
    totalItems, setTotalItems,
    ideas, setIdeas,
    retryCount, setRetryCount,
    retryType, setRetryType
  } = usePaginationState(initialPage);
  
  // Use ideas query hook
  const query = useIdeasQuery(
    options,
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
    
    // React Query data
    queryKey: query.queryKey,
    rawQueryResponse: query.data,
    dataUpdatedAt: query.dataUpdatedAt,
    
    // Configuration
    pageSize,
  };
}
