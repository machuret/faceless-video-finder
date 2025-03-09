import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface FacelessIdeasSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const FacelessIdeasSearchBar: React.FC<FacelessIdeasSearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery 
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  const handleClear = () => {
    setLocalQuery("");
    setSearchQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          className="pl-10 pr-10 w-full"
          placeholder="Search ideas..."
          value={localQuery}
          onChange={handleChange}
        />
        {localQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute inset-y-0 right-0 px-3"
            onClick={handleClear}
          >
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        )}
      </div>
      <Button type="submit" className="sr-only">Search</Button>
    </form>
  );
};
