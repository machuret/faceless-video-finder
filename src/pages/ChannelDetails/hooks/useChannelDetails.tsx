
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

      // After basic channel data is loaded, fetch top performing videos
      fetchTopPerformingVideos(channelData.channel_title);
      
    } catch (err) {
      console.error("Error fetching channel details:", err);
      toast.error("Failed to load channel details");
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false
      }));
    }
  };

  const fetchTopPerformingVideos = async (channelTitle: string) => {
    setState(prev => ({ ...prev, topVideosLoading: true }));
    try {
      // We need the actual YouTube channel ID, not our internal UUID
      // Let's try to get it from the channel data first using the channel title as a search term
      const { data: searchData, error: searchError } = await supabase.functions.invoke('fetch-top-videos', {
        body: { channelId: channelTitle }
      });

      if (searchError) {
        console.error("Error fetching top videos:", searchError);
        throw searchError;
      }

      setState(prev => ({
        ...prev,
        mostViewedVideo: searchData.mostViewed || null,
        mostEngagingVideo: searchData.mostEngaging || null,
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
