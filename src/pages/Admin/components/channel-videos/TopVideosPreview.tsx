import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
}

interface TopVideosData {
  mostViewed: Video;
  mostEngaging: Video;
}

interface TopVideosPreviewProps {
  channelId: string;
  youtubeChannelId?: string;
}

const TopVideosPreview: React.FC<TopVideosPreviewProps> = ({ channelId, youtubeChannelId }) => {
  const [loading, setLoading] = useState(false);
  const [topVideos, setTopVideos] = useState<TopVideosData | null>(null);

  const extractYoutubeChannelId = (url: string) => {
    // Try to extract channel ID from URL patterns like /channel/UC...
    const channelMatch = url.match(/\/channel\/(UC[\w-]{22})/);
    if (channelMatch) return channelMatch[1];
    
    // Try to match just a raw UC... ID
    const rawIdMatch = url.match(/(UC[\w-]{22})/);
    if (rawIdMatch) return rawIdMatch[1];
    
    return null;
  };

  const fetchTopVideos = async (id: string) => {
    if (!id) {
      toast.error("No YouTube channel ID available");
      return;
    }

    setLoading(true);
    toast.info("Fetching top videos...");

    try {
      const { data, error } = await supabase.functions.invoke('fetch-top-videos', {
        body: { channelId: id }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setTopVideos(data);
      toast.success("Top videos fetched successfully");
    } catch (error) {
      console.error("Error fetching top videos:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch top videos");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchVideos = async () => {
    // If a YouTube channel ID is directly provided, use it
    if (youtubeChannelId) {
      await fetchTopVideos(youtubeChannelId);
      return;
    }

    // Otherwise, try to fetch the channel URL from the database and extract the ID
    try {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("channel_url")
        .eq("id", channelId)
        .single();
      
      if (error) throw error;
      
      const extractedId = extractYoutubeChannelId(data.channel_url);
      if (!extractedId) {
        toast.error("Could not extract YouTube channel ID from URL");
        return;
      }
      
      await fetchTopVideos(extractedId);
    } catch (error) {
      console.error("Error getting channel URL:", error);
      toast.error("Failed to get channel information");
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Top Performing Videos</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleFetchVideos}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Fetch Videos
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!topVideos && !loading && (
          <div className="text-center py-6 text-muted-foreground">
            Click "Fetch Videos" to load top performing videos for this channel
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {topVideos && !loading && (
          <div className="space-y-6">
            {topVideos.mostViewed && (
              <div>
                <h3 className="font-medium mb-2">Most Viewed Video</h3>
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-gray-200 rounded overflow-hidden">
                    {topVideos.mostViewed.thumbnailUrl && (
                      <img 
                        src={topVideos.mostViewed.thumbnailUrl} 
                        alt="Video thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-2">{topVideos.mostViewed.title}</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                      <div>Views: {formatNumber(topVideos.mostViewed.viewCount)}</div>
                      <div>Likes: {formatNumber(topVideos.mostViewed.likeCount)}</div>
                      <div>Comments: {formatNumber(topVideos.mostViewed.commentCount)}</div>
                      <div>Published: {formatDate(topVideos.mostViewed.publishedAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {topVideos.mostEngaging && topVideos.mostEngaging.id !== topVideos.mostViewed?.id && (
              <div>
                <h3 className="font-medium mb-2">Most Engaging Video</h3>
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-gray-200 rounded overflow-hidden">
                    {topVideos.mostEngaging.thumbnailUrl && (
                      <img 
                        src={topVideos.mostEngaging.thumbnailUrl} 
                        alt="Video thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-2">{topVideos.mostEngaging.title}</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                      <div>Views: {formatNumber(topVideos.mostEngaging.viewCount)}</div>
                      <div>Likes: {formatNumber(topVideos.mostEngaging.likeCount)}</div>
                      <div>Comments: {formatNumber(topVideos.mostEngaging.commentCount)}</div>
                      <div>Published: {formatDate(topVideos.mostEngaging.publishedAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopVideosPreview;
