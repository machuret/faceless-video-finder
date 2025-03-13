
import { supabase } from "@/integrations/supabase/client";
import { FetchIdeasOptions } from './types';

export const buildQuery = (options: FetchIdeasOptions) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'label',
    sortOrder = 'asc',
    search = '',
    filter = {}
  } = options;

  // Calculate pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // Start building query
  let query = supabase
    .from('faceless_ideas')
    .select('*', { count: 'exact' });
  
  // Apply search filter
  if (search) {
    query = query.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  // Apply additional filters - using a simplified approach to prevent TypeScript recursion
  if (Object.keys(filter).length > 0) {
    // Use type assertion to avoid TypeScript analyzing the object structure recursively
    const filterObj: Record<string, unknown> = filter as any;
    
    for (const key of Object.keys(filterObj)) {
      const value = filterObj[key];
      // Only apply the filter if it has a meaningful value
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    }
  }
  
  // Add sorting and pagination
  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);
  
  // Metadata for debugging
  const queryMetadata = {
    table: 'faceless_ideas',
    filterApplied: !!search || Object.keys(filter).length > 0,
    paginationRange: `${from}-${to}`,
    sortApplied: `${sortBy} ${sortOrder}`
  };
  
  return { query, from, to, queryMetadata };
};

export const buildCountQuery = (options: Pick<FetchIdeasOptions, 'search' | 'filter'>) => {
  const { search = '', filter = {} } = options;
  
  // Start building count query
  let query = supabase
    .from('faceless_ideas')
    .select('id', { count: 'exact', head: true });
  
  // Apply search filter
  if (search) {
    query = query.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  // Apply additional filters - using a simplified approach to prevent TypeScript recursion
  if (Object.keys(filter).length > 0) {
    // Use type assertion to avoid TypeScript analyzing the object structure recursively
    const filterObj: Record<string, unknown> = filter as any;
    
    for (const key of Object.keys(filterObj)) {
      const value = filterObj[key];
      // Only apply the filter if it has a meaningful value
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    }
  }
  
  return query;
};
