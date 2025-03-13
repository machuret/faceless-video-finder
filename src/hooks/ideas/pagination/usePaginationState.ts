
import { useState, useCallback } from 'react';
import { FacelessIdeaInfo } from '@/services/facelessIdeas';
import { UseIdeasPaginationState, RetryTypeCategory } from './types';

export function usePaginationState(initialPage: number): UseIdeasPaginationState & {
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setTotalItems: (items: number) => void;
  setIdeas: (ideas: FacelessIdeaInfo[]) => void;
  setRetryCount: (count: number) => void;
  setRetryType: (type: RetryTypeCategory) => void;
} {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [ideas, setIdeas] = useState<FacelessIdeaInfo[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [retryType, setRetryType] = useState<RetryTypeCategory>('unknown');

  return {
    currentPage,
    totalPages,
    totalItems,
    ideas,
    retryCount,
    retryType,
    setCurrentPage,
    setTotalPages,
    setTotalItems,
    setIdeas,
    setRetryCount,
    setRetryType
  };
}
