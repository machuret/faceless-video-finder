
import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
  autoSubmit?: boolean;
  debounceTime?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialQuery = "",
  placeholder = "Search...",
  className = "",
  showClearButton = true,
  autoSubmit = false,
  debounceTime = 300
}) => {
  const [query, setQuery] = useState(initialQuery);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (autoSubmit) {
      // Clear existing timer
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
      
      // Set new timer for debounced search
      debounceTimerRef.current = window.setTimeout(() => {
        onSearch(value);
        debounceTimerRef.current = null;
      }, debounceTime);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          className="pl-10 pr-10"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
        />
        {showClearButton && query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={handleClear}
            type="button"
          >
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        )}
      </div>
      {!autoSubmit && (
        <Button type="submit" className="sr-only">Search</Button>
      )}
    </form>
  );
};

export default SearchBar;
