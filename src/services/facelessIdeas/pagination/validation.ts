
import { FetchIdeasOptions } from './types';
import { MIN_PAGE_SIZE, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, DEFAULT_SORT_BY, DEFAULT_SORT_ORDER } from './constants';

export const validateQueryParams = (options: FetchIdeasOptions): FetchIdeasOptions => {
  const {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    sortBy = DEFAULT_SORT_BY,
    sortOrder = DEFAULT_SORT_ORDER,
    search = '',
    filter = {},
    useCache = true,
    cacheTTL,
    forceCountRefresh = false
  } = options;

  // Validate page and pageSize
  const validatedPage = Math.max(1, parseInt(String(page), 10) || 1);
  let validatedPageSize = parseInt(String(pageSize), 10) || DEFAULT_PAGE_SIZE;
  validatedPageSize = Math.min(Math.max(validatedPageSize, MIN_PAGE_SIZE), MAX_PAGE_SIZE);

  // Sanitize search string
  const validatedSearch = typeof search === 'string' ? search.trim() : '';

  // Sanitize sort parameters
  const validSortFields = ['id', 'label', 'created_at', 'updated_at'];
  const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : DEFAULT_SORT_BY;
  const validatedSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : DEFAULT_SORT_ORDER;

  // Return validated parameters
  return {
    page: validatedPage,
    pageSize: validatedPageSize,
    sortBy: validatedSortBy,
    sortOrder: validatedSortOrder as 'asc' | 'desc',
    search: validatedSearch,
    filter,
    useCache,
    cacheTTL,
    forceCountRefresh
  };
};
