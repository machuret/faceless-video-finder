
// Cache interface for strongly typed caching
interface CacheOptions {
  expiry?: number; // Time in milliseconds until cache expires
  version?: string; // Version string for cache busting when app logic changes
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number | null;
  version: string | null;
}

// Get item from cache with type safety
export function getCache<T>(key: string, options: { version?: string } = {}): T | null {
  try {
    const cacheVersion = options.version || '1.0';
    const stored = localStorage.getItem(`cache_${key}`);
    
    if (!stored) return null;
    
    const item: CacheItem<T> = JSON.parse(stored);
    
    // Check version mismatch (cache busting)
    if (item.version && cacheVersion && item.version !== cacheVersion) {
      console.log(`Cache version mismatch for ${key}: stored=${item.version}, current=${cacheVersion}`);
      localStorage.removeItem(`cache_${key}`);
      return null;
    }
    
    // Check expiry
    if (item.expiry) {
      const now = Date.now();
      const expiryTime = item.timestamp + item.expiry;
      
      if (now > expiryTime) {
        console.log(`Cache expired for ${key}`);
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
    }
    
    return item.data;
  } catch (err) {
    console.error(`Error reading from cache for key ${key}:`, err);
    // Clean up potentially corrupted cache
    localStorage.removeItem(`cache_${key}`);
    return null;
  }
}

// Set item in cache with type safety
export function setCache<T>(
  key: string, 
  data: T, 
  options: CacheOptions = {}
): void {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: options.expiry || null,
      version: options.version || null
    };
    
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
  } catch (err) {
    console.error(`Error writing to cache for key ${key}:`, err);
  }
}

// Clear all cache items
export function clearCache(): void {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} cache items`);
  } catch (err) {
    console.error('Error clearing cache:', err);
  }
}

// Clear specific cache item
export function clearCacheItem(key: string): void {
  localStorage.removeItem(`cache_${key}`);
}
