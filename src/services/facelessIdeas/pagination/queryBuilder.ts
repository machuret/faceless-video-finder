
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
  
  // Apply filters - completely new approach
  let hasFilters = false;
  
  // Manual filter application without recursion
  // Convert object to primitive array first to avoid TypeScript analyzing the structure
  const safeFilter = JSON.parse(JSON.stringify(filter));
  
  // Apply each filter explicitly
  for (const key in safeFilter) {
    // Using 'in' operator and skipping prototype chain
    if (Object.prototype.hasOwnProperty.call(safeFilter, key)) {
      const value = safeFilter[key];
      
      // Skip undefined, null or empty values
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // Apply the filter directly without type analysis
      query = query.eq(key, value);
      hasFilters = true;
    }
  }
  
  // Add sorting and pagination
  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);
  
  // Metadata for debugging
  const queryMetadata = {
    table: 'faceless_ideas',
    filterApplied: !!search || hasFilters,
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
  
  // Use same new approach for filters
  const safeFilter = JSON.parse(JSON.stringify(filter));
  
  for (const key in safeFilter) {
    if (Object.prototype.hasOwnProperty.call(safeFilter, key)) {
      const value = safeFilter[key];
      
      // Skip undefined, null or empty values
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // Apply the filter directly
      query = query.eq(key, value);
    }
  }
  
  return query;
};
