
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChannelDetailsState } from "./types";
import { extractIdFromSlug, extractYouTubeChannelId } from "./utils";
import { fetchChannelDetails, fetchTopPerformingVideos } from "@/services/channelApi";

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
    let isMounted = true;
    
    const loadData = async () => {
      let idToLoad = channelId || (slug ? extractIdFromSlug(slug) : null);
      
      if (!idToLoad) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            error: "Invalid channel ID or URL",
            loading: false,
            topVideosLoading: false
          }));
        }
        return;
      }

      try {
        // Fetch channel details and video stats in parallel
        const [channelResult, videoStatsResult] = await Promise.all([
          fetchChannelDetails(idToLoad),
          fetchTopPerformingVideos(idToLoad)
        ]).catch(error => {
          throw new Error(`Failed to fetch channel data: ${error.message}`);
        });

        if (!isMounted) return;

        // Update state with channel data
        setState(prev => ({
          ...prev,
          channel: channelResult.channel,
          videoStats: channelResult.videoStats || [],
          loading: false,
          error: null,
          mostViewedVideo: videoStatsResult?.mostViewedVideo || null,
          mostEngagingVideo: videoStatsResult?.mostEngagingVideo || null,
          topVideosLoading: false,
          topVideosError: false
        }));

      } catch (error) {
        console.error("Error loading channel details:", error);
        
        if (isMounted) {
          setState(prev => ({
            ...prev,
            error: error instanceof Error ? error.message : "Failed to load channel details",
            loading: false,
            topVideosLoading: false,
            topVideosError: true
          }));
          
          toast.error("Failed to load channel details");
        }
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [channelId, slug]);

  return state;
};
