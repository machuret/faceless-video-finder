
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { VideoStats } from "@/types/youtube";
import { Play } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import { getChannelSlug } from "@/utils/channelUtils";
import { supabase } from "@/integrations/supabase/client";
import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

interface FeaturedVideosProps {
  videos: VideoStats[];
  isFeatured?: boolean;
}

// Memoized VideoCardContent for better performance
const VideoCardContent = memo(({ 
  video, 
  channelId, 
  channelTitle,
  priority 
}: { 
  video: VideoStats, 
  channelId: string, 
  channelTitle: string,
  priority: boolean 
}) => {
  const formattedViews = video.views 
    ? parseInt(video.views.toString()).toLocaleString()
    : '0';
    
  const formattedLikes = video.likes 
    ? parseInt(video.likes.toString()).toLocaleString()
    : '0';
    
  return (
    <>
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {video.thumbnail_url ? (
          <OptimizedImage
            src={video.thumbnail_url}
            alt={video.title || "Video thumbnail"}
            className="w-full h-full object-cover"
            priority={priority}
            width={640}
            height={360}
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
              <span className="font-medium">{formattedViews}</span>
              <span className="ml-1">views</span>
            </div>
          )}
          {video.likes && (
            <div>
              <span className="font-medium">{formattedLikes}</span>
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
});

VideoCardContent.displayName = "VideoCardContent";

const FeaturedVideos = memo(({ videos, isFeatured = false }: FeaturedVideosProps) => {
  // Extract unique channel IDs for efficient querying
  const channelIds = useMemo(() => {
    return [...new Set(videos.filter(v => v.channel_id).map(v => v.channel_id))];
  }, [videos]);
  
  // Use React Query to fetch channel titles efficiently
  const { data: channelTitles = {} } = useQuery({
    queryKey: ['channelTitles', channelIds],
    queryFn: async () => {
      if (channelIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_title")
        .in("id", channelIds);
      
      if (error) {
        console.error("Error fetching channel titles:", error);
        return {};
      }
      
      // Create a map of channel ID to channel title
      return data.reduce((acc, channel) => {
        acc[channel.id] = channel.channel_title;
        return acc;
      }, {} as Record<string, string>);
    },
    enabled: channelIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (!videos || videos.length === 0) {
    return null;
  }

  // Only show top 6 videos for performance
  const topVideos = videos.slice(0, 6);

  return (
    <div className="mt-12">
      <h2 className="font-crimson text-2xl font-bold text-gray-800 mb-4">
        {isFeatured ? "Featured Videos" : "Popular Videos"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topVideos.map((video, index) => {
          // Use a fallback for channel_id if it's not available
          const channelId = video.channel_id || "";
          
          // Get channel title from our state
          const channelTitle = channelTitles[channelId] || "Unknown channel";
          
          // Create channel object for slug generation
          const channel = {
            id: channelId,
            channel_title: channelTitle
          };
          
          // Create SEO-friendly channel URL with actual channel title
          const seoUrl = `/channel/${getChannelSlug(channel)}`;
          
          // Direct link to YouTube video if available
          const videoUrl = video.video_id ? 
            `https://www.youtube.com/watch?v=${video.video_id}` : 
            seoUrl;
          
          // Prioritize loading for the first 3 videos
          const isPriority = index < 3;
          
          return (
            <Card key={video.id} className="hover:shadow-md transition-shadow">
              {video.video_id ? (
                // External link for YouTube videos
                <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                  <VideoCardContent 
                    video={video} 
                    channelId={channelId} 
                    channelTitle={channelTitle}
                    priority={isPriority}
                  />
                </a>
              ) : (
                // Internal link for channel pages
                <Link to={seoUrl}>
                  <VideoCardContent 
                    video={video} 
                    channelId={channelId} 
                    channelTitle={channelTitle}
                    priority={isPriority}
                  />
                </Link>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
});

export default memo(FeaturedVideos);
