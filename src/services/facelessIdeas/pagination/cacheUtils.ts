
import { getCache, setCache, clearCacheItem, invalidateCache } from "@/utils/cacheUtils";
import { FetchIdeasOptions } from "./types";

// Cache keys
const CACHE_PREFIX = "faceless_ideas";
const CACHE_VERSION = "1.0";

// Get cache key for specific query options
export const getFacelessIdeasCacheKey = (options: FetchIdeasOptions): string => {
  const { page, pageSize, sortBy, sortOrder, search, filter } = options;
  
  // Create a deterministic key from the options
  const filterString = filter ? JSON.stringify(filter) : "";
  return `${CACHE_PREFIX}_${page}_${pageSize}_${sortBy}_${sortOrder}_${search}_${filterString}`;
};

// Get cached faceless ideas
export const getCachedFacelessIdeas = <T>(cacheKey: string): T | null => {
  return getCache<T>(cacheKey, { version: CACHE_VERSION });
};

// Set cached faceless ideas
export const setCachedFacelessIdeas = <T>(cacheKey: string, data: T, expiryMs: number = 5 * 60 * 1000): void => {
  setCache(cacheKey, data, { expiry: expiryMs, version: CACHE_VERSION });
};

// Invalidate all faceless ideas caches
export const invalidateFacelessIdeasCache = (): void => {
  // This is a simple approach - we could be more targeted if needed
  // For now, we'll just remove all faceless ideas caches
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`cache_${CACHE_PREFIX}`)) {
      clearCacheItem(key.substring(6)); // Remove the "cache_" prefix
    }
  }
};

// Invalidate a specific faceless ideas cache
export const invalidateFacelessIdeaCache = (ideaId: string): void => {
  // Find and clear any cache that might contain this idea
  invalidateCache(`${CACHE_PREFIX}_idea_${ideaId}`);
  
  // Also invalidate all list caches since they might include this idea
  invalidateFacelessIdeasCache();
};
