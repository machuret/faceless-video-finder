
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
  
  // SOLUTION 1: Use .match() method for a cleaner filter application
  // This prevents TypeScript from creating recursive type chains
  if (Object.keys(filter).length > 0) {
    // Create a clean object with only valid filters
    const cleanFilter: Record<string, any> = {};
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanFilter[key] = value;
      }
    });
    
    if (Object.keys(cleanFilter).length > 0) {
      query = query.match(cleanFilter);
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
  
  // SOLUTION 1: Use .match() method for the count query as well
  if (Object.keys(filter).length > 0) {
    // Create a clean object with only valid filters
    const cleanFilter: Record<string, any> = {};
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanFilter[key] = value;
      }
    });
    
    if (Object.keys(cleanFilter).length > 0) {
      query = query.match(cleanFilter);
    }
  }
  
  return query;
};
