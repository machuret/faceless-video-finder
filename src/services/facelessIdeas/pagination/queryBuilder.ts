
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
  
  // Apply additional filters - avoid TypeScript's type analysis completely
  let hasFilters = false;
  
  // Convert filter to plain array of entries to bypass TypeScript's deep analysis
  const entries: [string, any][] = [];
  for (const key in filter) {
    if (Object.prototype.hasOwnProperty.call(filter, key)) {
      entries.push([key, filter[key as keyof typeof filter]]);
    }
  }
  
  // Process entries directly with no complex type analysis
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    
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
  
  // Apply additional filters using the same approach as above to avoid TypeScript analysis
  const entries: [string, any][] = [];
  for (const key in filter) {
    if (Object.prototype.hasOwnProperty.call(filter, key)) {
      entries.push([key, filter[key as keyof typeof filter]]);
    }
  }
  
  // Process entries directly
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    
    // Skip empty values
    if (value === undefined || value === null || value === '') {
      continue;
    }
    
    // Apply the filter
    query = query.eq(key, value);
  }
  
  return query;
};
