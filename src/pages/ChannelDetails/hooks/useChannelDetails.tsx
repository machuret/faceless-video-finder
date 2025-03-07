
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChannelDetailsState } from "./types";
import { extractIdFromSlug, extractYouTubeChannelId } from "./utils";
import { fetchChannelDetails, fetchTopPerformingVideos } from "./api";

export const useChannelDetails = (channelId?: string, slug?: string) => {
  const [state, setState] = useState<ChannelDetailsState>({
    channel: null,
    videoStats: [],
    loading: true,
    error: null,
    topVideosLoading: true,
    mostViewedVideo: null,
    mostEngagingVideo: null,
    topVideosError: false
  });

  useEffect(() => {
    if (channelId) {
      // Direct ID lookup
      loadChannelDetails(channelId);
    } else if (slug) {
      // Extract ID from slug (format: title-id)
      const idFromSlug = extractIdFromSlug(slug);
      if (idFromSlug) {
        loadChannelDetails(idFromSlug);
      } else {
        setState(prev => ({
          ...prev,
          error: "Invalid channel URL",
          loading: false
        }));
      }
    }
  }, [channelId, slug]);

  const loadChannelDetails = async (id: string) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      // Fetch basic channel data and video stats
      const { channel, videoStats } = await fetchChannelDetails(id);
      
      setState(prev => ({
        ...prev,
        channel,
        videoStats,
        loading: false
      }));

      // After basic channel data is loaded, fetch top performing videos if possible
      const youtubeChannelId = extractYouTubeChannelId(channel.channel_url);
      if (youtubeChannelId) {
        loadTopPerformingVideos(youtubeChannelId);
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

  const loadTopPerformingVideos = async (youtubeChannelId: string) => {
    setState(prev => ({ ...prev, topVideosLoading: true, topVideosError: false }));
    try {
      const { mostViewedVideo, mostEngagingVideo } = await fetchTopPerformingVideos(youtubeChannelId);
      
      setState(prev => ({
        ...prev,
        mostViewedVideo,
        mostEngagingVideo,
        topVideosLoading: false,
        topVideosError: false
      }));
    } catch (err) {
      console.error("Error fetching top performing videos:", err);
      setState(prev => ({
        ...prev,
        topVideosLoading: false,
        topVideosError: true
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
    mostEngagingVideo: state.mostEngagingVideo,
    topVideosError: state.topVideosError
  };
};
