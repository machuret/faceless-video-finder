
import { supabase } from "@/integrations/supabase/client";
import { FacelessIdeaInfo } from "./types";
import { getCache, setCache, invalidateCache } from "@/utils/cacheUtils";

// Error types for better error handling
export class FacelessIdeasError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FacelessIdeasError";
  }
}

export class NetworkError extends FacelessIdeasError {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ServerError extends FacelessIdeasError {
  constructor(message: string) {
    super(message);
    this.name = "ServerError";
  }
}

export class ValidationError extends FacelessIdeasError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// Explicitly define the options interface without recursive types
export interface FetchIdeasOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
  useCache?: boolean;
  cacheTTL?: number; // in milliseconds
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  executionTime?: number; // Added for performance tracking
}

// Constants
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_PAGE_SIZE = 12;
const CACHE_PREFIX = 'faceless_ideas_';

/**
 * Validates and sanitizes query parameters
 */
const validateQueryParams = (options: FetchIdeasOptions): FetchIdeasOptions => {
  const validated: FetchIdeasOptions = { ...options };
  
  // Validate page
  if (validated.page !== undefined) {
    if (typeof validated.page !== 'number' || validated.page < 1) {
      throw new ValidationError('Page must be a positive number');
    }
  }
  
  // Validate pageSize
  if (validated.pageSize !== undefined) {
    if (typeof validated.pageSize !== 'number' || validated.pageSize < 1 || validated.pageSize > 100) {
      throw new ValidationError('Page size must be between 1 and 100');
    }
  }
  
  // Validate sortBy
  if (validated.sortBy !== undefined) {
    const allowedSortFields = ['label', 'created_at', 'updated_at']; 
    if (!allowedSortFields.includes(validated.sortBy)) {
      throw new ValidationError(`Sort field must be one of: ${allowedSortFields.join(', ')}`);
    }
  }
  
  // Validate sortOrder
  if (validated.sortOrder !== undefined && !['asc', 'desc'].includes(validated.sortOrder)) {
    throw new ValidationError('Sort order must be either "asc" or "desc"');
  }
  
  // Sanitize search term (basic sanitization, can be expanded)
  if (validated.search) {
    validated.search = validated.search.trim();
  }
  
  return validated;
};

/**
 * Generates a cache key based on query parameters
 */
const generateCacheKey = (options: FetchIdeasOptions): string => {
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
 * Builds a query with all the filters and options
 */
const buildQuery = (options: FetchIdeasOptions) => {
  const {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    search = '',
    sortBy = 'label',
    sortOrder = 'asc',
    filter = {}
  } = options;
  
  // Calculate start and end range for pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // Start building the query
  let query = supabase
    .from("faceless_ideas")
    .select("*", { count: 'exact' });
  
  // Add search filter if provided
  if (search) {
    // Use more sophisticated search with multiple fields
    query = query.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  // Add custom filters
  if (filter && typeof filter === 'object') {
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
  }
  
  // Add sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  
  // Add pagination
  query = query.range(from, to);
  
  return { query, from, to };
};

/**
 * Fetch faceless ideas with pagination support, caching, and improved error handling
 */
export const fetchPaginatedIdeas = async (
  options: FetchIdeasOptions = {}
): Promise<PaginatedResponse<FacelessIdeaInfo>> => {
  const startTime = performance.now();
  
  try {
    // Validate and sanitize inputs
    const validatedOptions = validateQueryParams(options);
    const {
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      useCache = true,
      cacheTTL = DEFAULT_CACHE_TTL
    } = validatedOptions;
    
    // Try to get from cache first
    if (useCache) {
      const cacheKey = generateCacheKey(validatedOptions);
      const cachedData = getCache<PaginatedResponse<FacelessIdeaInfo>>(cacheKey);
      
      if (cachedData) {
        console.log(`Cache hit for faceless ideas: ${cacheKey}`);
        return {
          ...cachedData,
          executionTime: 0 // It's from cache, so execution time is negligible
        };
      }
      
      console.log(`Cache miss for faceless ideas: ${cacheKey}`);
    }
    
    // Build the query
    const { query, from, to } = buildQuery(validatedOptions);
    
    console.log(`Fetching ideas: page ${page}, range ${from}-${to}, options:`, validatedOptions);
    
    // Execute the query
    const { data, error, count } = await query;
    
    // Handle server errors
    if (error) {
      if (error.code === 'PGRST116') {
        throw new ValidationError('Invalid query parameters');
      } else if (error.code?.startsWith('23')) { 
        throw new ValidationError(`Database constraint error: ${error.message}`);
      } else if (error.code?.startsWith('P0')) {
        throw new ServerError(`Database connection error: ${error.message}`);
      } else {
        throw new ServerError(`Database error: ${error.message}`);
      }
    }
    
    const totalPages = Math.ceil((count || 0) / pageSize);
    
    console.log(`Fetched ${data?.length || 0} ideas, total count: ${count}, pages: ${totalPages}`);
    
    // Ensure all returned records have the required properties
    const ideas = (data || []).map(item => ({
      ...item,
      image_url: item.image_url || null
    })) as FacelessIdeaInfo[];
    
    const executionTime = performance.now() - startTime;
    
    // Prepare response
    const response: PaginatedResponse<FacelessIdeaInfo> = {
      data: ideas,
      count: count || 0,
      page,
      pageSize,
      totalPages,
      executionTime
    };
    
    // Cache the result if caching is enabled
    if (useCache) {
      const cacheKey = generateCacheKey(validatedOptions);
      setCache(cacheKey, response, { expiry: cacheTTL });
    }
    
    return response;
  } catch (error: any) {
    console.error("Error fetching paginated faceless ideas:", error);
    
    // Rethrow with appropriate error type
    if (error instanceof FacelessIdeasError) {
      throw error;
    } else if (error.message && (
      error.message.includes('fetch') || 
      error.message.includes('network') || 
      error.message.includes('timeout') ||
      error.message.includes('abort')
    )) {
      throw new NetworkError(`Network error: ${error.message}`);
    } else {
      throw new FacelessIdeasError(`Unknown error: ${error.message}`);
    }
  }
};

/**
 * Invalidate cache for faceless ideas
 */
export const invalidateFacelessIdeasCache = (): void => {
  try {
    // Invalidate all faceless ideas caches
    const cachePrefix = CACHE_PREFIX;
    console.log(`Invalidating cache with prefix: ${cachePrefix}`);
    invalidateCache(cachePrefix);
  } catch (error) {
    console.error("Error invalidating faceless ideas cache:", error);
  }
};

// Define error filter type independently to avoid recursive definitions
export type RetryErrorFilter = (error: any) => boolean;

// Define the retry options without recursive type references
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  errorFilter?: RetryErrorFilter;
}

/**
 * Retry a function with exponential backoff and circuit breaker pattern
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2,
    errorFilter
  } = options;
  
  let attempt = 0;
  let lastError: any;
  
  const execute = async (): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;
      
      // Check if we should retry based on error type
      if (errorFilter && !errorFilter(error)) {
        console.log(`Error doesn't match filter criteria, not retrying.`);
        throw error;
      }
      
      // Check if we've exceeded max retries
      if (attempt > maxRetries) {
        console.log(`Maximum retries (${maxRetries}) exceeded.`);
        throw error;
      }
      
      // Calculate delay with exponential backoff and some randomization
      const delay = Math.min(
        initialDelay * Math.pow(factor, attempt - 1) * (1 + 0.2 * Math.random()),
        maxDelay
      );
      
      console.log(`Retry attempt ${attempt}/${maxRetries} after ${Math.round(delay)}ms...`);
      
      return new Promise((resolve) => {
        setTimeout(() => resolve(execute()), delay);
      });
    }
  };
  
  return execute();
};
