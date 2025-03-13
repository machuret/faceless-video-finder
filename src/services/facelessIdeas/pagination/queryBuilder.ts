
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
  
  // Apply additional filters using an approach that avoids TypeScript type recursion
  let hasFilters = false;
  
  // Cast to 'any' to completely bypass TypeScript type checking
  const filterObj = filter as any;
  
  // Use basic JavaScript iteration to avoid TypeScript analyzing the object structure
  for (const key in filterObj) {
    if (Object.prototype.hasOwnProperty.call(filterObj, key)) {
      const value = filterObj[key];
      
      // Skip empty values
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // Apply the filter
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
  
  // Apply additional filters using the same approach as above
  // Cast to 'any' to completely bypass TypeScript type checking
  const filterObj = filter as any;
  
  // Use basic JavaScript iteration
  for (const key in filterObj) {
    if (Object.prototype.hasOwnProperty.call(filterObj, key)) {
      const value = filterObj[key];
      
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
