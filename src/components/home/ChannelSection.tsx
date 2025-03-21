
import { useState, useEffect, useMemo } from "react";
import ChannelGrid from "./ChannelGrid";
import ChannelPagination from "./ChannelPagination";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface ChannelSectionProps {
  channels: any[];
  featuredChannels: any[];
  loading: boolean;
  error: string | null;
  totalChannels: number;
  currentPage: number;
  showFeatured: boolean;
  channelsPerPage: number;
  setCurrentPage: (page: number) => void;
}

const ChannelSection = ({
  channels,
  featuredChannels,
  loading,
  error,
  totalChannels,
  currentPage,
  showFeatured,
  channelsPerPage,
  setCurrentPage,
}: ChannelSectionProps) => {
  const [sortAlphabetically, setSortAlphabetically] = useState(false);

  const resetFilters = () => {
    setCurrentPage(1);
    setSortAlphabetically(false);
  };

  // Apply sorting if needed - use useMemo to avoid unnecessary re-sorting
  const sortedChannels = useMemo(() => {
    if (!sortAlphabetically) return channels;
    
    return [...channels].sort((a, b) => 
      (a.channel_title || "").localeCompare(b.channel_title || "")
    );
  }, [channels, sortAlphabetically]);

  // Toggle alphabetical sorting
  const toggleAlphabeticalSort = () => {
    setSortAlphabetically(prev => !prev);
  };

  // Only show featured channels if they exist and showFeatured is true
  const shouldShowFeatured = featuredChannels.length > 0 && showFeatured && !loading && !error;

  return (
    <div className="container mx-auto px-4 py-16">
      {shouldShowFeatured && (
        <div className="mb-16">
          <h2 className="font-crimson text-3xl font-bold text-gray-800 mb-6">
            Featured Channels
          </h2>
          <ChannelGrid 
            channels={featuredChannels}
            loading={false}
            error={null}
            resetFilters={() => {}}
            isFeatured={true}
          />
        </div>
      )}

      {!loading && !error && channels.length > 0 && (
        <div className="flex justify-end mb-6">
          <Button 
            variant="outline" 
            onClick={toggleAlphabeticalSort}
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortAlphabetically ? "Original Order" : "Sort A-Z"}
          </Button>
        </div>
      )}

      <ChannelGrid 
        channels={sortedChannels}
        loading={loading}
        error={error}
        resetFilters={resetFilters}
        isFeatured={false}
      />
      
      {!loading && !error && totalChannels > channelsPerPage && (
        <ChannelPagination 
          currentPage={currentPage}
          totalChannels={totalChannels}
          channelsPerPage={channelsPerPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ChannelSection;
