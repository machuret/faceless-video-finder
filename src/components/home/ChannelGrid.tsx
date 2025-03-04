
import { Channel, VideoStats } from "@/types/youtube";
import ChannelCard from "./ChannelCard";
import FeaturedVideos from "./FeaturedVideos";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";

interface ChannelGridProps {
  channels: Channel[];
  loading: boolean;
  resetFilters: () => void;
  isFeatured?: boolean;
}

const ChannelGrid = ({ channels, loading, resetFilters, isFeatured = false }: ChannelGridProps) => {
  if (loading) {
    return <LoadingState />;
  }

  if (channels.length === 0) {
    return <EmptyState resetFilters={resetFilters} isFeatured={isFeatured} />;
  }

  // Get all videos from all channels
  const allVideos = channels
    .flatMap(channel => channel.videoStats || [])
    .filter((video): video is VideoStats => !!video)
    .sort((a, b) => (b.views || 0) - (a.views || 0)); // Sort by views, most viewed first

  console.log('ChannelGrid rendering with channels:', channels.map(c => c.channel_title));

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
      <FeaturedVideos videos={allVideos} isFeatured={isFeatured} />
    </div>
  );
};

export default ChannelGrid;
