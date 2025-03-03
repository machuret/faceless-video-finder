
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VideoStats } from "@/types/youtube";
import VideoCard from "@/components/youtube/VideoCard";
import { useInView } from "react-intersection-observer";

interface FeaturedVideosProps {
  videos: VideoStats[];
  isFeatured?: boolean;
}

const FeaturedVideos = ({ videos, isFeatured = false }: FeaturedVideosProps) => {
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

  if (videos.length === 0 || isFeatured) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="font-crimson text-2xl font-bold mb-6 text-gray-800">Featured Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos
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
      {visibleVideos < videos.length && visibleVideos < 12 && (
        <div
          ref={loadMoreRef}
          className="text-center py-8"
        >
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-400 border-r-transparent"></div>
          <p className="text-gray-500 text-sm mt-2">Loading more videos...</p>
        </div>
      )}
      
      {visibleVideos < videos.length && visibleVideos >= 12 && (
        <div className="text-center mt-8">
          <Button
            onClick={() => setVisibleVideos(prev => Math.min(prev + 6, videos.length))}
            variant="outline"
            className="mx-auto"
          >
            Load More Videos
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeaturedVideos;
