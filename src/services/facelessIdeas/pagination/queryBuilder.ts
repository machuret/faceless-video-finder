
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
  
  // Start with the base query
  let query = supabase.from('faceless_ideas').select('*', { count: 'exact' });
  
  // Apply search filter using the query builder's or method (this works well)
  if (search) {
    query = query.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  // Apply filters using multiple individual filter operations
  // This approach avoids TypeScript recursion depth issues
  if (Object.keys(filter).length > 0) {
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null && value !== '') {
        // Use type assertion to avoid TypeScript recursion errors
        query = query.filter(key, 'eq', value);
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
  
  // Apply search filter using the query builder's or method
  if (search) {
    query = query.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  // Apply filters using the same approach as in the main query
  if (Object.keys(filter).length > 0) {
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null && value !== '') {
        // Use type assertion to avoid TypeScript recursion errors
        query = query.filter(key, 'eq', value);
      }
    }
  }
  
  return query;
};
