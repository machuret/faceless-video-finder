
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/youtube";
import { toast } from "sonner";

interface TopVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
}

interface ChannelDetailsState {
  channel: Channel | null;
  videoStats: any[];
  loading: boolean;
  error: string | null;
  topVideosLoading: boolean;
  mostViewedVideo: TopVideo | null;
  mostEngagingVideo: TopVideo | null;
}

export const useChannelDetails = (channelId?: string, slug?: string) => {
  const [state, setState] = useState<ChannelDetailsState>({
    channel: null,
    videoStats: [],
    loading: true,
    error: null,
    topVideosLoading: true,
    mostViewedVideo: null,
    mostEngagingVideo: null
  });

  useEffect(() => {
    if (channelId) {
      // Direct ID lookup
      fetchChannelDetails(channelId);
    } else if (slug) {
      // Extract ID from slug (format: title-id)
      const idFromSlug = extractIdFromSlug(slug);
      if (idFromSlug) {
        fetchChannelDetails(idFromSlug);
      } else {
        setState(prev => ({
          ...prev,
          error: "Invalid channel URL",
          loading: false
        }));
      }
    }
  }, [channelId, slug]);

  const extractIdFromSlug = (slug: string): string | null => {
    // UUID pattern: 8-4-4-4-12 hex digits with hyphens
    // Example: ac004f01-4aad-439d-b1ab-59988473f7fc
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = slug.match(uuidPattern);
    
    if (match && match[0]) {
      console.log("Extracted UUID from slug:", match[0]);
      return match[0];
    }
    
    return null;
  };

  const fetchChannelDetails = async (id: string) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      console.log(`Fetching channel details for ID: ${id}`);
      
      // Fetch channel details
      const { data: channelData, error: channelError } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("id", id)
        .single();

      if (channelError) {
        console.error("Error fetching channel details:", channelError);
        throw channelError;
      }
      
      if (!channelData) {
        console.error("No channel found with ID:", id);
        throw new Error("Channel not found");
      }
      
      // Fetch video stats for this channel
      const { data: videoData, error: videoError } = await supabase
        .from("youtube_video_stats")
        .select("*")
        .eq("channel_id", id);
        
      if (videoError) throw videoError;

      setState(prev => ({
        ...prev,
        channel: channelData as unknown as Channel,
        videoStats: videoData || [],
        loading: false
      }));

      // After basic channel data is loaded, fetch top performing videos if YouTube channel ID is available
      if (channelData.youtube_channel_id) {
        fetchTopPerformingVideosWithYouTubeId(channelData.youtube_channel_id);
      } else {
        // Set top videos loading to false since we can't fetch them
        setState(prev => ({
          ...prev,
          topVideosLoading: false
        }));
      }
      
    } catch (err) {
      console.error("Error fetching channel details:", err);
      toast.error("Failed to load channel details");
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
        topVideosLoading: false
      }));
    }
  };

  const fetchTopPerformingVideosWithYouTubeId = async (youtubeChannelId: string) => {
    setState(prev => ({ ...prev, topVideosLoading: true }));
    try {
      console.log(`Fetching top videos with YouTube channel ID: ${youtubeChannelId}`);
      
      const { data, error } = await supabase.functions.invoke('fetch-top-videos', {
        body: { channelId: youtubeChannelId }
      });

      if (error) {
        console.error("Error fetching top videos:", error);
        throw error;
      }

      if (data.error) {
        console.error("API error fetching top videos:", data.error);
        throw new Error(data.error);
      }

      setState(prev => ({
        ...prev,
        mostViewedVideo: data.mostViewed || null,
        mostEngagingVideo: data.mostEngaging || null,
        topVideosLoading: false
      }));
    } catch (err) {
      console.error("Error fetching top performing videos:", err);
      setState(prev => ({
        ...prev,
        topVideosLoading: false
      }));
    }
  };

  return {
    channel: state.channel,
    videoStats: state.videoStats,
    loading: state.loading,
    error: state.error,
    topVideosLoading: state.topVideosLoading,
    mostViewedVideo: state.mostViewedVideo,
    mostEngagingVideo: state.mostEngagingVideo
  };
};
