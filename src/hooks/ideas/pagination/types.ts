
import { FacelessIdeaInfo } from '@/services/facelessIdeas';
import { 
  NetworkError, 
  ServerError, 
  ValidationError,
  SortOrder,
  RetryTypeCategory as BaseRetryTypeCategory
} from '@/services/facelessIdeas/paginatedService';

export interface IdeasPaginationOptions {
  pageSize?: number;
  initialPage?: number;
  retryLimit?: number;
  retryDelay?: number; 
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  filter?: Record<string, any>;
  useCache?: boolean;
  cacheTTL?: number;
}

export interface UseIdeasPaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  ideas: FacelessIdeaInfo[];
  retryCount: number;
  retryType: RetryTypeCategory;
}

export interface UseIdeasPaginationReturn extends UseIdeasPaginationState {
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  handlePageChange: (page: number) => void;
  resetPagination: () => void;
  refreshData: (bustCache?: boolean) => void;
  smartRetry: <T>(fetcher: () => Promise<T>) => Promise<T>;
  invalidateIdeasCache: () => void;
  prefetchNextPage: () => void;
  queryKey: any[];
  rawQueryResponse: any;
  dataUpdatedAt: number;
  pageSize: number;
}

export type RetryTypeCategory = BaseRetryTypeCategory;
