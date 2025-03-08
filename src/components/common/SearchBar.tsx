
import React, { useState, useEffect } from "react";
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
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialQuery = "",
  placeholder = "Search...",
  className = "",
  showClearButton = true,
  autoSubmit = true
}) => {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (autoSubmit) {
      onSearch(value);
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
    </form>
  );
};

export default SearchBar;
