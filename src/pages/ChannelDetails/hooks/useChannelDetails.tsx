
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
    // Reset state when channelId or slug changes
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      topVideosLoading: true,
      topVideosError: false
    }));

    // Use a flag to prevent state updates if the component unmounts
    let isMounted = true;
    
    const loadChannel = async () => {
      let idToLoad = null;
      
      if (channelId) {
        // Direct ID lookup
        console.log(`Using direct channelId: ${channelId}`);
        idToLoad = channelId;
      } else if (slug) {
        // Extract ID from slug (format: title-id)
        console.log(`Extracting ID from slug: ${slug}`);
        idToLoad = extractIdFromSlug(slug);
        console.log(`Extracted ID: ${idToLoad}`);
        
        if (!idToLoad && isMounted) {
          setState(prev => ({
            ...prev,
            error: "Invalid channel URL",
            loading: false,
            topVideosLoading: false
          }));
          return;
        }
      }
      
      if (!idToLoad) return;
      
      try {
        // Add timeout protection
        const fetchPromise = fetchChannelDetails(idToLoad);
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Channel details request timeout")), 10000)
        );
        
        // Fetch basic channel data and video stats with timeout protection
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (isMounted) {
          setState(prev => ({
            ...prev,
            channel: result.channel,
            videoStats: result.videoStats,
            loading: false
          }));
          
          // After basic channel data is loaded, fetch top performing videos if possible
          const youtubeChannelId = extractYouTubeChannelId(result.channel.channel_url);
          if (youtubeChannelId) {
            loadTopPerformingVideos(youtubeChannelId);
          } else {
            // Set top videos loading to false since we can't fetch them
            setState(prev => ({
              ...prev,
              topVideosLoading: false
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching channel details:", err);
        
        if (isMounted) {
          toast.error("Failed to load channel details");
          setState(prev => ({
            ...prev,
            error: err instanceof Error ? err.message : "Unknown error",
            loading: false,
            topVideosLoading: false
          }));
        }
      }
    };

    const loadTopPerformingVideos = async (youtubeChannelId: string) => {
      if (!isMounted) return;
      
      setState(prev => ({ ...prev, topVideosLoading: true, topVideosError: false }));
      
      try {
        // Add timeout protection
        const fetchPromise = fetchTopPerformingVideos(youtubeChannelId);
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Top videos request timeout")), 8000)
        );
        
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (isMounted) {
          setState(prev => ({
            ...prev,
            mostViewedVideo: result.mostViewedVideo,
            mostEngagingVideo: result.mostEngagingVideo,
            topVideosLoading: false,
            topVideosError: false
          }));
        }
      } catch (err) {
        console.error("Error fetching top performing videos:", err);
        
        if (isMounted) {
          setState(prev => ({
            ...prev,
            topVideosLoading: false,
            topVideosError: true
          }));
        }
      }
    };

    // Start loading
    loadChannel();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [channelId, slug]);

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
