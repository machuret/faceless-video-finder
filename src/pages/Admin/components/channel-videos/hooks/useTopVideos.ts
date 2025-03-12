import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
}

export interface TopVideosData {
  mostViewed: Video;
  mostEngaging: Video;
}

export const useTopVideos = (channelId: string, youtubeChannelId?: string) => {
  const [loading, setLoading] = useState(false);
  const [topVideos, setTopVideos] = useState<TopVideosData | null>(null);

  const extractYoutubeChannelId = (url: string) => {
    if (!url) return null;
    
    // Try to extract channel ID from URL patterns
    const patterns = [
      /youtube\.com\/channel\/(UC[\w-]{22})/i,         // youtube.com/channel/UC...
      /youtube\.com\/c\/(UC[\w-]{22})/i,               // youtube.com/c/UC...
      /youtube\.com\/@[\w-]+\/(UC[\w-]{22})/i,         // youtube.com/@username/UC...
      /youtube\.com\/(UC[\w-]{22})/i,                  // youtube.com/UC...
      /(UC[\w-]{22})/i                                 // Any UC... pattern
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const id = match[1];
        // Ensure proper capitalization (UC at the start)
        return id.startsWith('uc') ? 'UC' + id.substring(2) : id;
      }
    }
    
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
      // Ensure the ID is properly formatted with uppercase UC prefix
      const formattedId = id.startsWith('uc') ? 'UC' + id.substring(2) : id;
      console.log(`Using YouTube channel ID for top videos fetch: ${formattedId}`);

      const { data, error } = await supabase.functions.invoke('fetch-top-videos', {
        body: { channelId: formattedId }
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
      
      console.log(`Channel URL from database: ${data.channel_url}`);
      const extractedId = extractYoutubeChannelId(data.channel_url);
      if (!extractedId) {
        toast.error("Could not extract YouTube channel ID from URL. The URL format should be like 'youtube.com/channel/UCxxxxxxxx' or similar.");
        return;
      }
      
      console.log(`Extracted YouTube channel ID: ${extractedId}`);
      await fetchTopVideos(extractedId);
    } catch (error) {
      console.error("Error getting channel URL:", error);
      toast.error("Failed to get channel information");
    }
  };

  return {
    loading,
    topVideos,
    handleFetchVideos
  };
};
