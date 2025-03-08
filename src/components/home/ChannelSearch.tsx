
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "@/components/common/SearchBar";

interface ChannelSearchProps {
  onSearch: (query: string) => void;
}

const ChannelSearch: React.FC<ChannelSearchProps> = ({ onSearch }) => {
  const [searchParams] = useSearchParams();
  const [initialQuery, setInitialQuery] = useState("");
  
  useEffect(() => {
    // Get the search query from URL parameters
    const queryParam = searchParams.get("search") || "";
    if (queryParam) {
      setInitialQuery(queryParam);
      onSearch(queryParam);
    }
  }, [searchParams, onSearch]);

  return (
    <div className="mb-6">
      <SearchBar
        initialQuery={initialQuery}
        onSearch={onSearch}
        placeholder="Search for channels, niches, or content types..."
        className="max-w-2xl mx-auto"
      />
    </div>
  );
};

export default ChannelSearch;
