import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { VideoStats } from "@/types/youtube";
import { Play } from "lucide-react";
import LazyImage from "@/components/ui/lazy-image";
import { generateChannelSlug } from "@/utils/channelSlug";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface FeaturedVideosProps {
  videos: VideoStats[];
  isFeatured?: boolean;
}

const FeaturedVideos = ({ videos, isFeatured = false }: FeaturedVideosProps) => {
  const [channelTitles, setChannelTitles] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Get unique channel IDs from videos
    const channelIds = [...new Set(videos.filter(v => v.channel_id).map(v => v.channel_id))];
    
    if (channelIds.length === 0) return;
    
    // Fetch channel titles for these IDs
    const fetchChannelTitles = async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_title")
        .in("id", channelIds);
      
      if (error) {
        console.error("Error fetching channel titles:", error);
        return;
      }
      
      // Create a map of channel ID to channel title
      const titleMap = data.reduce((acc, channel) => {
        acc[channel.id] = channel.channel_title;
        return acc;
      }, {} as Record<string, string>);
      
      setChannelTitles(titleMap);
    };
    
    fetchChannelTitles();
  }, [videos]);

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
          
          // Get channel title from our state
          const channelTitle = channelTitles[channelId] || "Unknown channel";
          
          // Create SEO-friendly channel URL with actual channel title
          const channelSlug = generateChannelSlug(channelTitle);
          const seoUrl = `/channel/${channelSlug}-${channelId}`;
          
          // Direct link to YouTube video if available
          const videoUrl = video.video_id ? 
            `https://www.youtube.com/watch?v=${video.video_id}` : 
            seoUrl;
          
          return (
            <Card key={video.id} className="hover:shadow-md transition-shadow">
              {video.video_id ? (
                // External link for YouTube videos
                <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                  <VideoCardContent 
                    video={video} 
                    channelId={channelId} 
                    channelTitle={channelTitle}
                  />
                </a>
              ) : (
                // Internal link for channel pages
                <Link to={seoUrl}>
                  <VideoCardContent 
                    video={video} 
                    channelId={channelId} 
                    channelTitle={channelTitle}
                  />
                </Link>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Extracted card content into a separate component for reuse
const VideoCardContent = ({ 
  video, 
  channelId, 
  channelTitle 
}: { 
  video: VideoStats, 
  channelId: string, 
  channelTitle: string 
}) => {
  return (
    <>
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
          {channelTitle}
        </p>
      </CardContent>
    </>
  );
};

export default FeaturedVideos;
