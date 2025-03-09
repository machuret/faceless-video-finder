
import React from "react";
import SearchBar from "@/components/common/SearchBar";

interface FacelessIdeasSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const FacelessIdeasSearchBar: React.FC<FacelessIdeasSearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery 
}) => {
  return (
    <SearchBar
      initialQuery={searchQuery}
      onSearch={setSearchQuery}
      placeholder="Search ideas..."
      autoSubmit={true}
      debounceTime={300}
      className="w-full"
    />
  );
};
