
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
  
  // Apply search filter using the query builder's or method
  if (search) {
    query = query.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  // Apply filters one at a time - but handle filter manually to avoid TypeScript issues
  if (Object.keys(filter).length > 0) {
    // Safe way to apply filters without TypeScript recursion issues
    let filterString = '';
    const filterValues: any[] = [];
    
    Object.entries(filter).forEach(([key, value], index) => {
      if (value !== undefined && value !== null && value !== '') {
        if (filterString.length > 0) {
          filterString += ' and ';
        }
        filterString += `${key}.eq.${value}`;
      }
    });
    
    if (filterString) {
      query = query.or(filterString);
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
  
  // Apply filters - same approach as main query
  if (Object.keys(filter).length > 0) {
    let filterString = '';
    
    Object.entries(filter).forEach(([key, value], index) => {
      if (value !== undefined && value !== null && value !== '') {
        if (filterString.length > 0) {
          filterString += ' and ';
        }
        filterString += `${key}.eq.${value}`;
      }
    });
    
    if (filterString) {
      query = query.or(filterString);
    }
  }
  
  return query;
};
