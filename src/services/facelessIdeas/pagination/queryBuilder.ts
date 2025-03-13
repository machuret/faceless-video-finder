
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
  
  // Apply additional filters - use a primitive approach to avoid TypeScript analyzing the structure
  let hasFilters = false;
  
  // Create a plain JS object with no TypeScript typing
  const filterKeys = Object.keys(filter);
  
  // Loop through keys using index access to avoid type inference
  for (let i = 0; i < filterKeys.length; i++) {
    const key = filterKeys[i];
    // Use bracket notation to access values which doesn't trigger deep type checking
    const value = filter[key as keyof typeof filter];
    
    // Skip empty values
    if (value === undefined || value === null || value === '') {
      continue;
    }
    
    // Apply the filter
    query = query.eq(key, value);
    hasFilters = true;
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
  
  // Apply additional filters using the same primitive approach
  // Create a plain JS object with no TypeScript typing
  const filterKeys = Object.keys(filter);
  
  // Loop through keys using index access to avoid type inference
  for (let i = 0; i < filterKeys.length; i++) {
    const key = filterKeys[i];
    // Use bracket notation to access values which doesn't trigger deep type checking
    const value = filter[key as keyof typeof filter];
    
    // Skip empty values
    if (value === undefined || value === null || value === '') {
      continue;
    }
    
    // Apply the filter
    query = query.eq(key, value);
  }
  
  return query;
};
