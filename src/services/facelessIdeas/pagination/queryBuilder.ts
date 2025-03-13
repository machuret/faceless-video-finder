
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
  
  // Apply filters
  if (search) {
    query = query.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  // Apply any additional filters - avoiding TypeScript recursion with simple loops
  if (filter) {
    // Cast filter to any to avoid TypeScript deep analysis
    const filterObj = filter as Record<string, any>;
    const keys = Object.keys(filterObj);
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const val = filterObj[key];
      if (val !== undefined && val !== null && val !== '') {
        query = query.eq(key, val);
      }
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
  
  // Apply search filter
  if (search) {
    query = query.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  // Apply any additional filters - avoiding TypeScript recursion with simple loops
  if (filter) {
    // Cast filter to any to avoid TypeScript deep analysis
    const filterObj = filter as Record<string, any>;
    const keys = Object.keys(filterObj);
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const val = filterObj[key];
      if (val !== undefined && val !== null && val !== '') {
        query = query.eq(key, val);
      }
    }
  }
  
  return query;
};
