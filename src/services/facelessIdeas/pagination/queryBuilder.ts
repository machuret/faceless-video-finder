
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
  
  // Apply additional filters - avoid typescript deep analysis completely
  let hasFilters = false;
  
  // Convert the filter to a simpler structure that TypeScript won't analyze deeply
  // Use a raw JavaScript approach with no type inference
  const filterEntries: [string, unknown][] = [];
  
  // This approach completely breaks the type linkage that causes deep recursion
  for (const key in filter) {
    // Explicit prototype check to avoid inherited properties
    if (Object.prototype.hasOwnProperty.call(filter, key)) {
      // We access properties using string indexing to avoid TypeScript's type analysis
      filterEntries.push([key, (filter as Record<string, unknown>)[key]]);
    }
  }
  
  // Now apply each filter without TypeScript analyzing the relationship
  for (let i = 0; i < filterEntries.length; i++) {
    const [key, value] = filterEntries[i];
    
    // Skip empty values
    if (value === undefined || value === null || value === '') {
      continue;
    }
    
    // Apply the filter - we know key is a string and value can be any valid filter value
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
  
  // Apply additional filters - use the same pattern as above to avoid type analysis
  // Convert the filter to a simpler structure
  const filterEntries: [string, unknown][] = [];
  
  // Break the type linkage that causes recursion
  for (const key in filter) {
    if (Object.prototype.hasOwnProperty.call(filter, key)) {
      filterEntries.push([key, (filter as Record<string, unknown>)[key]]);
    }
  }
  
  // Apply each filter
  for (let i = 0; i < filterEntries.length; i++) {
    const [key, value] = filterEntries[i];
    
    // Skip empty values
    if (value === undefined || value === null || value === '') {
      continue;
    }
    
    // Apply the filter
    query = query.eq(key, value);
  }
  
  return query;
};
