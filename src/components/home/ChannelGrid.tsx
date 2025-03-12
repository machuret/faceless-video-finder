
import { Channel, VideoStats } from "@/types/youtube";
import ChannelCard from "./ChannelCard";
import FeaturedVideos from "./FeaturedVideos";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import React, { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChannelGridProps {
  channels: Channel[];
  loading: boolean;
  error?: string | null;
  resetFilters: () => void;
  isFeatured?: boolean;
}

// Memoize individual channel cards to prevent unnecessary rerenders
const MemoizedChannelCard = React.memo(ChannelCard);

const ChannelGrid = React.memo(({ channels, loading, error, resetFilters, isFeatured = false }: ChannelGridProps) => {
  // Early return for loading state
  if (loading) {
    return <LoadingState />;
  }

  // Early return for error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error loading channels</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white border border-red-300 rounded-md text-red-600 hover:bg-red-50"
          >
            Try Again
          </Button>
          <Button 
            onClick={resetFilters}
            variant="outline"
            className="px-4 py-2"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    );
  }

  // Early return for empty state
  if (channels.length === 0) {
    return <EmptyState resetFilters={resetFilters} isFeatured={isFeatured} />;
  }

  // Get all videos from all channels - only compute when channels change
  const allVideos = useMemo(() => {
    return channels
      .flatMap(channel => channel.videoStats || [])
      .filter((video): video is VideoStats => !!video)
      .sort((a, b) => (b.views || 0) - (a.views || 0)) // Sort by views, most viewed first
      .slice(0, 10); // Limit to top 10 videos for performance
  }, [channels]);

  return (
    <div>
      {/* Channel Grid with window-dependent rendering */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <MemoizedChannelCard 
            key={channel.id} 
            channel={channel}
            isFeatured={isFeatured}
          />
        ))}
      </div>

      {/* Featured Videos Section */}
      {allVideos.length > 0 && (
        <FeaturedVideos videos={allVideos} isFeatured={isFeatured} />
      )}
    </div>
  );
});

// Add display name for debugging
ChannelGrid.displayName = "ChannelGrid";

export default ChannelGrid;
