
import { supabase } from "@/integrations/supabase/client";
import { FetchIdeasOptions, SortOrder, FilterObject } from './types';
import { DEFAULT_PAGE_SIZE } from './constants';

/**
 * Result of the query builder with metadata for pagination
 */
interface QueryResult {
  query: any; // Using any type to avoid TS2589 (type instantiation is excessively deep)
  from: number;
  to: number;
  queryMetadata?: {
    sortColumn: string;
    filterCount: number;
    hasSearch: boolean;
  };
}

/**
 * Builds a query with all the filters and options with optimized execution paths
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
  
  // Track filter information for query optimization
  const filterCount = Object.keys(filter).length;
  const hasSearch = Boolean(search && search.trim().length > 0);
  
  // Start building the query with optimized column selection
  let query = supabase
    .from("faceless_ideas")
    .select("*", { count: 'exact' });
  
  // Optimize search with indexed lookup when possible
  if (hasSearch) {
    if (search.length <= 3) {
      // For very short searches, use more exact matching to avoid too many results
      query = query.ilike("label", `${search}%`);
    } else {
      // For longer searches, use more sophisticated search with multiple fields
      // Using ILIKE with % at both ends, but only on specific columns that matter
      query = query.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
    }
  }
  
  // Add custom filters with optimized ordering (most selective first)
  if (filter && typeof filter === 'object' && filterCount > 0) {
    // Put exact match filters first (more selective)
    const exactFilters = new Set(['id', 'is_active']);
    
    // Apply exact match filters first (more selective)
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && exactFilters.has(key)) {
        query = query.eq(key, value);
      }
    });
    
    // Then apply remaining filters
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !exactFilters.has(key)) {
        query = query.eq(key, value);
      }
    });
  }
  
  // Add sorting with proper indexing hints
  // Note: We're assuming there's an index on the sortBy column
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  
  // Add pagination
  query = query.range(from, to);
  
  return { 
    query, 
    from, 
    to,
    queryMetadata: {
      sortColumn: sortBy,
      filterCount,
      hasSearch
    }
  };
};

/**
 * Optimized query for counting total records that match certain criteria
 * This is more efficient than fetching the actual records with count
 */
export const buildCountQuery = (options: Omit<FetchIdeasOptions, 'page' | 'pageSize' | 'sortBy' | 'sortOrder'>): any => {
  const {
    search = '',
    filter = {}
  } = options;
  
  // For count queries, we only need the id column
  let query = supabase
    .from("faceless_ideas")
    .select("id", { count: 'exact', head: true });
  
  // Apply the same filtering logic as the main query
  if (search) {
    if (search.length <= 3) {
      query = query.ilike("label", `${search}%`);
    } else {
      query = query.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
    }
  }
  
  if (filter && typeof filter === 'object') {
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
  }
  
  return query;
};

