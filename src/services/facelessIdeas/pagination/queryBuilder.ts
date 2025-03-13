
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
  
  console.log(`Building query with options:`, JSON.stringify(options, null, 2));
  
  // Start with the base query
  let query = supabase.from('faceless_ideas').select('*', { count: 'exact' });
  
  try {
    // Apply search filter using the query builder's or method
    if (search) {
      console.log(`Applying search filter: ${search}`);
      query = query.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Apply filters one at a time with detailed logging
    if (Object.keys(filter).length > 0) {
      console.log(`Applying filters:`, JSON.stringify(filter, null, 2));
      
      // Build filter string - use eq for each filter with AND logic
      for (const [key, value] of Object.entries(filter)) {
        if (value !== undefined && value !== null && value !== '') {
          console.log(`Adding filter: ${key} = ${value}`);
          query = query.eq(key, value); // Use direct eq for clearer query logic
        }
      }
    }
    
    // Add sorting and pagination
    console.log(`Adding sorting: ${sortBy} ${sortOrder}`);
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    console.log(`Adding pagination: range ${from}-${to}`);
    query = query.range(from, to);
  } catch (error) {
    console.error(`Error building query:`, error);
    // Return the query as is if there's an error in building it
  }
  
  // Metadata for debugging
  const queryMetadata = {
    table: 'faceless_ideas',
    filterApplied: !!search || Object.keys(filter).length > 0,
    paginationRange: `${from}-${to}`,
    sortApplied: `${sortBy} ${sortOrder}`
  };
  
  console.log(`Query metadata:`, JSON.stringify(queryMetadata, null, 2));
  
  return { query, from, to, queryMetadata };
};

export const buildCountQuery = (options: Pick<FetchIdeasOptions, 'search' | 'filter'>) => {
  const { search = '', filter = {} } = options;
  
  console.log(`Building count query with search: "${search}" and filters:`, JSON.stringify(filter, null, 2));
  
  // Start building count query
  let query = supabase
    .from('faceless_ideas')
    .select('id', { count: 'exact', head: true });
  
  try {
    // Apply search filter
    if (search) {
      console.log(`Applying search filter to count query: ${search}`);
      query = query.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Apply filters with direct eq operators for clarity
    if (Object.keys(filter).length > 0) {
      console.log(`Applying filters to count query`);
      
      for (const [key, value] of Object.entries(filter)) {
        if (value !== undefined && value !== null && value !== '') {
          console.log(`Adding count filter: ${key} = ${value}`);
          query = query.eq(key, value);
        }
      }
    }
  } catch (error) {
    console.error(`Error building count query:`, error);
    // Return the query as is if there's an error in building it
  }
  
  return query;
};
