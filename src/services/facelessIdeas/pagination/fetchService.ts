import { validateQueryParams } from './validation';
import { buildQuery, buildCountQuery } from './queryBuilder';
import { getCachedFacelessIdeas, setCachedFacelessIdeas, getFacelessIdeasCacheKey } from './cacheUtils';
import { 
  FetchIdeasOptions, 
  PaginatedResponse, 
  FacelessIdeasError, 
  NetworkError, 
  ServerError, 
  ValidationError 
} from './types';
import { DEFAULT_CACHE_TTL, DEFAULT_PAGE_SIZE } from './constants';
import { FacelessIdeaInfo } from '../types';

// Export error classes for use in other modules
export { NetworkError, ServerError, ValidationError, FacelessIdeasError };

/**
 * Performance-optimized function to fetch faceless ideas with smart pagination, 
 * caching, and improved error handling
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
      cacheTTL = DEFAULT_CACHE_TTL,
      forceCountRefresh = false
    } = validatedOptions;
    
    // Try to get from cache first for faster responses
    if (useCache) {
      const cacheKey = getFacelessIdeasCacheKey(validatedOptions);
      const cachedData = getCachedFacelessIdeas<PaginatedResponse<FacelessIdeaInfo>>(cacheKey);
      
      if (cachedData) {
        console.log(`Cache hit for faceless ideas: ${JSON.stringify(validatedOptions)}`);
        return {
          ...cachedData,
          executionTime: 0, // It's from cache, so execution time is negligible
          fromCache: true
        };
      }
      
      console.log(`Cache miss for faceless ideas: ${JSON.stringify(validatedOptions)}`);
    }
    
    // Build the optimized query
    const { query, from, to, queryMetadata } = buildQuery(validatedOptions);
    
    console.log(`Fetching ideas: page ${page}, range ${from}-${to}, options:`, validatedOptions);
    
    // Performance optimization: Only fetch count if we're on page 1 or count is explicitly requested
    // For other pages, we can often rely on cached total counts
    const needsExactCount = page === 1 || forceCountRefresh;
    
    // Execute the query - with conditional count to improve performance
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
    
    let totalCount = count;
    
    // If we didn't get an exact count but need total pages, do a separate count query
    // This happens when we have a cached response but need fresh count
    if (totalCount === null && forceCountRefresh) {
      try {
        const countQuery = buildCountQuery({
          search: validatedOptions.search,
          filter: validatedOptions.filter
        });
        
        const { count: exactCount, error: countError } = await countQuery;
        
        if (!countError && exactCount !== null) {
          totalCount = exactCount;
        }
      } catch (countErr) {
        console.warn("Error fetching exact count, using estimate:", countErr);
        // Continue with null count, we'll estimate based on current page
      }
    }
    
    // Calculate total pages based on count or estimate
    const totalPages = totalCount !== null
      ? Math.ceil(totalCount / pageSize)
      : Math.max(page, 1); // If count unavailable, assume at least current page exists
    
    console.log(`Fetched ${data?.length || 0} ideas, total count: ${totalCount}, pages: ${totalPages}`);
    
    // Ensure all returned records have the required properties
    const ideas = (data || []).map(item => ({
      ...item,
      image_url: item.image_url || null
    })) as FacelessIdeaInfo[];
    
    const executionTime = performance.now() - startTime;
    
    // Prepare response with performance metadata
    const response: PaginatedResponse<FacelessIdeaInfo> = {
      data: ideas,
      count: totalCount || 0,
      page,
      pageSize,
      totalPages,
      executionTime,
      queryInfo: queryMetadata ? {
        ...queryMetadata,
        executionTimeMs: executionTime
      } : undefined
    };
    
    // Cache the result if caching is enabled
    if (useCache) {
      const cacheKey = getFacelessIdeasCacheKey(validatedOptions);
      setCachedFacelessIdeas(cacheKey, response, cacheTTL);
    }
    
    return response;
  } catch (error: any) {
    console.error("Error fetching paginated faceless ideas:", error);
    
    // Rethrow with appropriate error type for better error handling
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
