
import { supabase } from "@/integrations/supabase/client";
import { FetchIdeasOptions, SortOrder, FilterObject } from './types';
import { DEFAULT_PAGE_SIZE } from './constants';

interface QueryResult {
  query: any; // Using a generic 'any' type to avoid type recursion issues
  from: number;
  to: number;
}

/**
 * Builds a query with all the filters and options
 */
export const buildQuery = (options: FetchIdeasOptions): QueryResult => {
  const {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    search = '',
    sortBy = 'label',
    sortOrder = 'asc',
    filter = {}
  } = options;
  
  // Calculate start and end range for pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // Start building the query
  let query = supabase
    .from("faceless_ideas")
    .select("*", { count: 'exact' });
  
  // Add search filter if provided
  if (search) {
    // Use more sophisticated search with multiple fields
    query = query.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  // Add custom filters
  if (filter && typeof filter === 'object') {
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
  }
  
  // Add sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  
  // Add pagination
  query = query.range(from, to);
  
  return { query, from, to };
};
