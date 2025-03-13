
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
  
  // Apply individual filters one by one instead of using the raw SQL approach
  // This addresses the TypeScript issue by using the proper filter method signature
  Object.entries(filter).forEach(([key, value]) => {
    // Skip undefined, null or empty values
    if (value === undefined || value === null || value === '') {
      return;
    }
    
    // Use the standard column-operator-value format
    // This matches the expected overload of the filter method
    query = query.eq(key, value);
  });
  
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
  
  // Apply filters directly without using raw SQL
  Object.entries(filter).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    
    // Use standard filter method with column, operator, value format
    query = query.eq(key, value);
  });
  
  return query;
};
