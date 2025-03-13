
import { getCache, setCache, invalidateCache } from "@/utils/cacheUtils";
import { FetchIdeasOptions, PaginatedResponse } from './types';
import { CACHE_PREFIX, DEFAULT_PAGE_SIZE } from './constants';

/**
 * Generates a cache key based on query parameters
 */
export const generateCacheKey = (options: FetchIdeasOptions): string => {
  const {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    search = '',
    sortBy = 'label',
    sortOrder = 'asc',
    filter = {}
  } = options;
  
  // Create a deterministic string representation of filters
  const filterStr = Object.entries(filter)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join(',');
  
  return `${CACHE_PREFIX}${page}_${pageSize}_${search}_${sortBy}_${sortOrder}_${filterStr}`;
};

/**
 * Get data from cache for a specific query
 */
export const getCachedResults = <T>(options: FetchIdeasOptions): PaginatedResponse<T> | null => {
  const cacheKey = generateCacheKey(options);
  return getCache<PaginatedResponse<T>>(cacheKey);
};

/**
 * Set data to cache for a specific query
 */
export const setCachedResults = <T>(
  options: FetchIdeasOptions, 
  data: PaginatedResponse<T>,
  ttl: number
): void => {
  const cacheKey = generateCacheKey(options);
  setCache(cacheKey, data, { expiry: ttl });
};

/**
 * Invalidate cache for faceless ideas
 */
export const invalidateFacelessIdeasCache = (): void => {
  try {
    // Invalidate all faceless ideas caches
    console.log(`Invalidating cache with prefix: ${CACHE_PREFIX}`);
    invalidateCache(CACHE_PREFIX);
  } catch (error) {
    console.error("Error invalidating faceless ideas cache:", error);
  }
};
