
import { supabase } from "@/integrations/supabase/client";
import { FacelessIdeaInfo } from "./types";

interface FetchIdeasOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch faceless ideas with pagination support
 */
export const fetchPaginatedIdeas = async ({
  page = 1,
  pageSize = 12,
  search = '',
  sortBy = 'label',
  sortOrder = 'asc'
}: FetchIdeasOptions = {}): Promise<PaginatedResponse<FacelessIdeaInfo>> => {
  try {
    // Calculate start and end range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    console.log(`Fetching ideas: page ${page}, range ${from}-${to}`);
    
    // Build the query
    let query = supabase
      .from("faceless_ideas")
      .select("*", { count: 'exact' });
    
    // Add search filter if provided
    if (search) {
      query = query.ilike('label', `%${search}%`);
    }
    
    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Add pagination
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    const totalPages = Math.ceil((count || 0) / pageSize);
    
    console.log(`Fetched ${data?.length || 0} ideas, total count: ${count}, pages: ${totalPages}`);
    
    // Ensure all returned records have the required properties
    const ideas = (data || []).map(item => ({
      ...item,
      image_url: item.image_url || null
    })) as FacelessIdeaInfo[];
    
    return {
      data: ideas,
      count: count || 0,
      page,
      pageSize,
      totalPages
    };
  } catch (error: any) {
    console.error("Error fetching paginated faceless ideas:", error.message);
    throw error;
  }
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  initialDelay = 1000
): Promise<T> => {
  let attempt = 0;
  
  const execute = async (): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > retries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(`Retry attempt ${attempt}/${retries} after ${delay}ms...`);
      
      return new Promise((resolve) => {
        setTimeout(() => resolve(execute()), delay);
      });
    }
  };
  
  return execute();
};
