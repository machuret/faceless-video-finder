
/**
 * Utility functions for caching data in localStorage
 */

const CACHE_PREFIX = 'ytfaceless_cache_';
const DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Cache item structure
interface CacheItem<T> {
  data: T;
  expiry: number;
  version: string;
}

/**
 * Set data in localStorage cache with expiration
 */
export function setCache<T>(
  key: string, 
  data: T, 
  options: { 
    expiry?: number; // time in milliseconds
    version?: string; // version to invalidate cache on app updates
  } = {}
): void {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const now = new Date().getTime();
    const expiryTime = options.expiry || DEFAULT_EXPIRY;
    const version = options.version || '1.0';
    
    const cacheItem: CacheItem<T> = {
      data,
      expiry: now + expiryTime,
      version
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
  } catch (error) {
    console.warn('Failed to set cache:', error);
    // Fail silently - caching is a non-critical feature
  }
}

/**
 * Get data from localStorage cache if it exists and is not expired
 */
export function getCache<T>(
  key: string, 
  options: { 
    version?: string;
  } = {}
): T | null {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cachedItem = localStorage.getItem(cacheKey);
    
    if (!cachedItem) return null;
    
    const parsedItem = JSON.parse(cachedItem) as CacheItem<T>;
    const now = new Date().getTime();
    const currentVersion = options.version || '1.0';
    
    // Check if cache is expired or version mismatch
    if (parsedItem.expiry < now || parsedItem.version !== currentVersion) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return parsedItem.data;
  } catch (error) {
    console.warn('Failed to get cache:', error);
    return null;
  }
}

/**
 * Clear all application cache items
 */
export function clearAllCache(): void {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

/**
 * Invalidate specific cache item
 */
export function invalidateCache(key: string): void {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn('Failed to invalidate cache:', error);
  }
}
