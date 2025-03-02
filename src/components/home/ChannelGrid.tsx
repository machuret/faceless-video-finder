import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Channel, VideoStats } from "@/types/youtube";
import VideoCard from "@/components/youtube/VideoCard";
import { useInView } from "react-intersection-observer";
import { Star } from "lucide-react";

interface ChannelGridProps {
  channels: Channel[];
  loading: boolean;
  resetFilters: () => void;
  isFeatured?: boolean;
}

// Lazy-loaded image component
const LazyImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      {inView ? (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
          />
        </>
      ) : (
        <div className="w-full h-full bg-gray-200"></div>
      )}
    </div>
  );
};

const ChannelGrid = ({ channels, loading, resetFilters, isFeatured = false }: ChannelGridProps) => {
  // State to track which videos to show (for progressive loading)
  const [visibleVideos, setVisibleVideos] = useState(3);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  // Increase visible videos when the load more marker comes into view
  useEffect(() => {
    if (inView) {
      setVisibleVideos(prev => Math.min(prev + 3, 12)); // Max 12 videos
    }
  }, [inView]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium font-montserrat">Loading channels...</p>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600 text-lg font-lato">No channels found matching your criteria.</p>
        {!isFeatured && (
          <Button 
            variant="outline" 
            className="mt-4 font-montserrat"
            onClick={resetFilters}
          >
            Reset filters
          </Button>
        )}
      </div>
    );
  }

  // Get all videos from all channels
  const allVideos = channels
    .flatMap(channel => channel.videoStats || [])
    .filter((video): video is VideoStats => !!video)
    .sort((a, b) => (b.views || 0) - (a.views || 0)); // Sort by views, most viewed first

  return (
    <div>
      {/* Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <Card 
            key={channel.id} 
            className={`hover:shadow-lg transition-shadow overflow-hidden ${isFeatured ? 'border-yellow-400 border-2' : ''}`}
          >
            <Link to={`/channel/${channel.id}`}>
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {channel.screenshot_url ? (
                  <LazyImage 
                    src={channel.screenshot_url} 
                    alt={channel.channel_title || "Channel screenshot"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <p className="text-gray-400 font-lato">No screenshot</p>
                  </div>
                )}
                {channel.is_featured && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-full flex items-center text-xs font-semibold">
                    <Star className="h-3 w-3 mr-1" fill="white" />
                    Featured
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-crimson text-lg font-semibold mb-2 line-clamp-1">{channel.channel_title}</h3>
                <div className="flex items-center gap-x-4 text-sm text-gray-500 mb-3 font-montserrat">
                  <div className="flex items-center">
                    <span className="font-medium">{channel.total_subscribers ? parseInt(channel.total_subscribers.toString()).toLocaleString() : '0'}</span>
                    <span className="ml-1">subscribers</span>
                  </div>
                  <div>
                    <span className="font-medium">{channel.total_views ? parseInt(channel.total_views.toString()).toLocaleString() : '0'}</span>
                    <span className="ml-1">views</span>
                  </div>
                </div>
                <p className="font-lato text-gray-600 line-clamp-2 text-sm mb-2">
                  {channel.description || "No description available"}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {channel.niche && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-montserrat">
                      {channel.niche}
                    </span>
                  )}
                  {channel.channel_category && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full font-montserrat">
                      {channel.channel_category}
                    </span>
                  )}
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Featured Videos Section */}
      {allVideos.length > 0 && !isFeatured && (
        <div className="mt-12">
          <h2 className="font-crimson text-2xl font-bold mb-6 text-gray-800">Featured Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allVideos
              .slice(0, visibleVideos)
              .map((video: VideoStats) => (
                <VideoCard
                  key={video.video_id}
                  title={video.title || "Untitled Video"}
                  video_id={video.video_id}
                  thumbnail_url={video.thumbnail_url || ""}
                  stats={`${video.views?.toLocaleString() || 0} views`}
                />
              ))}
          </div>
          
          {/* Load more marker */}
          {visibleVideos < allVideos.length && visibleVideos < 12 && (
            <div
              ref={loadMoreRef}
              className="text-center py-8"
            >
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-400 border-r-transparent"></div>
              <p className="text-gray-500 text-sm mt-2">Loading more videos...</p>
            </div>
          )}
          
          {visibleVideos < allVideos.length && visibleVideos >= 12 && (
            <div className="text-center mt-8">
              <Button
                onClick={() => setVisibleVideos(prev => Math.min(prev + 6, allVideos.length))}
                variant="outline"
                className="mx-auto"
              >
                Load More Videos
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChannelGrid;
