
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
  
  // Instead of dynamically applying filters which causes TypeScript issues,
  // we'll use a different approach with direct SQL text conditions
  
  // Extract filter conditions to an array of SQL fragments
  const sqlConditions: string[] = [];
  const params: Record<string, any> = {};
  let paramIndex = 1;
  
  // Using Object.entries avoids TypeScript recursion issues
  Object.entries(filter).forEach(([key, value]) => {
    // Skip undefined, null or empty values
    if (value === undefined || value === null || value === '') {
      return;
    }
    
    // Create a parameter name that won't conflict
    const paramName = `p${paramIndex}`;
    
    // Add the condition using column = :paramName syntax
    sqlConditions.push(`${key} = :${paramName}`);
    
    // Add the parameter value to our params object
    params[paramName] = value;
    
    paramIndex++;
  });
  
  // If we have SQL conditions, apply them using a raw SQL filter if needed
  if (sqlConditions.length > 0) {
    // Join all conditions with AND
    const filterText = sqlConditions.join(' AND ');
    query = query.filter(filterText, params);
  }
  
  // Add sorting and pagination
  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);
  
  // Metadata for debugging
  const queryMetadata = {
    table: 'faceless_ideas',
    filterApplied: !!search || sqlConditions.length > 0,
    paginationRange: `${from}-${to}`,
    sortApplied: `${sortBy} ${sortOrder}`,
    sqlConditions: sqlConditions.length > 0 ? sqlConditions : undefined
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
  
  // Using the same SQL direct approach for filters
  const sqlConditions: string[] = [];
  const params: Record<string, any> = {};
  let paramIndex = 1;
  
  Object.entries(filter).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    
    const paramName = `p${paramIndex}`;
    sqlConditions.push(`${key} = :${paramName}`);
    params[paramName] = value;
    paramIndex++;
  });
  
  if (sqlConditions.length > 0) {
    const filterText = sqlConditions.join(' AND ');
    query = query.filter(filterText, params);
  }
  
  return query;
};
