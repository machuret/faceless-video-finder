
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { VideoStats } from "@/types/youtube";
import { Play } from "lucide-react";
import LazyImage from "@/components/ui/lazy-image";
import { generateChannelSlug } from "@/pages/ChannelDetails";

interface FeaturedVideosProps {
  videos: VideoStats[];
  isFeatured?: boolean;
}

const FeaturedVideos = ({ videos, isFeatured = false }: FeaturedVideosProps) => {
  if (!videos || videos.length === 0) {
    return null;
  }

  // Only show top 6 videos
  const topVideos = videos.slice(0, 6);

  return (
    <div className="mt-12">
      <h2 className="font-crimson text-2xl font-bold text-gray-800 mb-4">
        {isFeatured ? "Featured Videos" : "Popular Videos"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topVideos.map((video) => {
          // Use a fallback for channel_id if it's not available
          const channelId = video.channel_id || "";
          
          // Create SEO-friendly channel URL with a default label
          const channelLabel = "channel"; // Default label
          const channelSlug = generateChannelSlug(channelLabel);
          const seoUrl = `/channel/${channelSlug}-${channelId}`;
          
          return (
            <Card key={video.id} className="hover:shadow-md transition-shadow">
              <Link to={seoUrl}>
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {video.thumbnail_url ? (
                    <LazyImage
                      src={video.thumbnail_url}
                      alt={video.title || "Video thumbnail"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400">No thumbnail</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-crimson text-lg font-semibold mb-2 line-clamp-2">
                    {video.title || "Untitled video"}
                  </h3>
                  <div className="flex items-center gap-x-4 text-sm text-gray-500">
                    {video.views && (
                      <div className="flex items-center">
                        <span className="font-medium">{parseInt(video.views.toString()).toLocaleString()}</span>
                        <span className="ml-1">views</span>
                      </div>
                    )}
                    {video.likes && (
                      <div>
                        <span className="font-medium">{parseInt(video.likes.toString()).toLocaleString()}</span>
                        <span className="ml-1">likes</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-blue-600 mt-2 font-montserrat">
                    Channel: {channelId ? `ID: ${channelId.substring(0, 8)}...` : "Unknown"}
                  </p>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedVideos;
