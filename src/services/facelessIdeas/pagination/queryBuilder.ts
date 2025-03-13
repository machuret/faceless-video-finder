
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
  
  // Apply additional filters - completely rewriting the approach
  // We'll manually handle each possible filter key to avoid TypeScript recursion
  const filterKeys = Object.keys(filter);
  if (filterKeys.length > 0) {
    for (let i = 0; i < filterKeys.length; i++) {
      const key = filterKeys[i];
      const value = filter[key as keyof typeof filter];
      
      // Skip empty values
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // Apply the filter
      query = query.eq(key, value);
    }
  }
  
  // Add sorting and pagination
  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);
  
  // Metadata for debugging
  const queryMetadata = {
    table: 'faceless_ideas',
    filterApplied: !!search || filterKeys.length > 0,
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
  
  // Apply additional filters - completely rewriting the approach
  // We'll manually handle each possible filter key to avoid TypeScript recursion
  const filterKeys = Object.keys(filter);
  if (filterKeys.length > 0) {
    for (let i = 0; i < filterKeys.length; i++) {
      const key = filterKeys[i];
      const value = filter[key as keyof typeof filter];
      
      // Skip empty values
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // Apply the filter
      query = query.eq(key, value);
    }
  }
  
  return query;
};
