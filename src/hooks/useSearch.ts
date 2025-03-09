
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from './useDebounce';

interface UseSearchOptions {
  debounceTime?: number;
  navigateOnSearch?: boolean; 
  searchParamName?: string;
  searchPath?: string;
  initialQuery?: string;
}

export function useSearch({
  debounceTime = 300,
  navigateOnSearch = false,
  searchParamName = 'search',
  searchPath = '/channels',
  initialQuery = ''
}: UseSearchOptions = {}) {
  // Get search params to read initial query if available
  const [searchParams] = useSearchParams();
  const initialSearchParam = searchParams.get(searchParamName) || initialQuery;
  
  const [query, setQuery] = useState(initialSearchParam);
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedQuery = useDebounce(query, debounceTime);
  const navigate = useNavigate();

  // Set up search handler
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    
    if (navigateOnSearch && searchQuery.trim()) {
      setIsSearching(true);
      navigate(`${searchPath}?${searchParamName}=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [navigate, navigateOnSearch, searchParamName, searchPath]);

  // Handle search submission
  const handleSearchSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    
    if (navigateOnSearch) {
      setIsSearching(true);
      navigate(`${searchPath}?${searchParamName}=${encodeURIComponent(trimmedQuery)}`);
    }
  }, [navigate, navigateOnSearch, query, searchParamName, searchPath]);

  // Clear the search
  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  // Reset isSearching when done
  useEffect(() => {
    setIsSearching(false);
  }, [debouncedQuery]);
  
  return {
    query,
    debouncedQuery,
    setQuery,
    isSearching,
    handleSearch,
    handleSearchSubmit,
    clearSearch
  };
}
