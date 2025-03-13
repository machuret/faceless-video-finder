
import { validateQueryParams } from './validation';
import { buildQuery } from './queryBuilder';
import { getCachedResults, setCachedResults } from './cacheUtils';
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
      const cachedData = getCachedResults<FacelessIdeaInfo>(validatedOptions);
      
      if (cachedData) {
        console.log(`Cache hit for faceless ideas: ${JSON.stringify(validatedOptions)}`);
        return {
          ...cachedData,
          executionTime: 0 // It's from cache, so execution time is negligible
        };
      }
      
      console.log(`Cache miss for faceless ideas: ${JSON.stringify(validatedOptions)}`);
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
      setCachedResults(validatedOptions, response, cacheTTL);
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
