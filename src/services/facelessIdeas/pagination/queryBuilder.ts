
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
  
  // Apply additional filters - completely avoid type recursion by using simple types
  let hasFilters = false;
  
  // Using indexed loop instead of for...of to avoid TypeScript type analysis recursion
  const keys = Object.keys(filter);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    // Use type assertion to any to bypass TypeScript's recursive analysis
    const value = (filter as any)[key];
    
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
  
  // Using the same approach to avoid type recursion
  const keys = Object.keys(filter);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    // Use type assertion to any to bypass TypeScript's recursive analysis
    const value = (filter as any)[key];
    
    // Skip empty values
    if (value === undefined || value === null || value === '') {
      continue;
    }
    
    // Apply the filter
    query = query.eq(key, value);
  }
  
  return query;
};
