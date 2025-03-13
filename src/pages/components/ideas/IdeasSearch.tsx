
import React, { useCallback } from "react";
import { Search, X, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface IdeasSearchProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleClearSearch: () => void;
  handleRetry: () => void;
  isLoading: boolean;
}

const IdeasSearch = ({
  searchInput,
  setSearchInput,
  handleClearSearch,
  handleRetry,
  isLoading
}: IdeasSearchProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-full md:w-auto">
        <Input
          type="text"
          placeholder="Search ideas..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9 pr-9"
        />
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        {searchInput && (
          <button 
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleRetry}
        disabled={isLoading}
      >
        <RefreshCcw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
};

export default IdeasSearch;
