
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
  
  // Use JavaScript array to completely avoid TypeScript type analysis
  const filterArray: Array<[string, any]> = [];
  
  // Manually build an array of key-value pairs without TypeScript analyzing the types
  // This method completely escapes TypeScript's recursion trap
  for (const key in filter) {
    if (Object.prototype.hasOwnProperty.call(filter, key)) {
      // We completely bypass TypeScript typing
      const obj = filter as Record<string, any>;
      const value = obj[key];
      filterArray.push([key, value]);
    }
  }
  
  // Apply each filter by reading directly from our manually created array
  for (let i = 0; i < filterArray.length; i++) {
    const key = filterArray[i][0];
    const value = filterArray[i][1];
    
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
  
  // Use the same method as above that works completely outside TypeScript's typing system
  const filterArray: Array<[string, any]> = [];
  
  // Manual construction of an array that TypeScript won't analyze
  for (const key in filter) {
    if (Object.prototype.hasOwnProperty.call(filter, key)) {
      // Using any type to escape TypeScript's analysis
      const obj = filter as Record<string, any>;
      const value = obj[key];
      filterArray.push([key, value]);
    }
  }
  
  // Apply each filter from our manually created array
  for (let i = 0; i < filterArray.length; i++) {
    const key = filterArray[i][0];
    const value = filterArray[i][1];
    
    // Skip empty values
    if (value === undefined || value === null || value === '') {
      continue;
    }
    
    // Apply the filter
    query = query.eq(key, value);
  }
  
  return query;
};
