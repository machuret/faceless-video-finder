
import { Channel, VideoStats } from "@/types/youtube";
import ChannelCard from "./ChannelCard";
import FeaturedVideos from "./FeaturedVideos";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import React, { useMemo } from "react";

interface ChannelGridProps {
  channels: Channel[];
  loading: boolean;
  resetFilters: () => void;
  isFeatured?: boolean;
}

const ChannelGrid = React.memo(({ channels, loading, resetFilters, isFeatured = false }: ChannelGridProps) => {
  // Early return for loading state
  if (loading) {
    return <LoadingState />;
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
      {/* Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <ChannelCard 
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
