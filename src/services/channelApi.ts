
import { supabase } from "@/integrations/supabase/client";
import { Channel, TopVideo } from "@/pages/ChannelDetails/hooks/types";

/**
 * Fetches a channel's details from Supabase
 * @param id Channel ID
 * @returns Channel data and video stats
 */
export const fetchChannelDetails = async (id: string) => {
  console.log(`Fetching channel details for ID: ${id}`);
  
  try {
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

    return {
      channel: channelData as unknown as Channel,
      videoStats: videoData || []
    };
  } catch (error) {
    console.error("Error in fetchChannelDetails:", error);
    throw error;
  }
};

/**
 * Fetches top performing videos for a YouTube channel
 * @param youtubeChannelId YouTube channel ID
 * @returns Most viewed and most engaging videos
 */
export const fetchTopPerformingVideos = async (youtubeChannelId: string) => {
  console.log(`Fetching top videos with YouTube channel ID: ${youtubeChannelId}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('fetch-top-videos', {
      body: { channelId: youtubeChannelId }
    });

    if (error) {
      console.error("Error fetching top videos:", error);
      throw error;
    }

    if (data?.error) {
      console.error("API error fetching top videos:", data.error);
      throw new Error(data.error);
    }

    return {
      mostViewedVideo: data?.mostViewed as TopVideo || null,
      mostEngagingVideo: data?.mostEngaging as TopVideo || null
    };
  } catch (error) {
    console.error("Error in fetchTopPerformingVideos:", error);
    return {
      mostViewedVideo: null,
      mostEngagingVideo: null
    };
  }
};

/**
 * Fetches related channels based on niche or similarity
 * @param currentChannelId ID of the current channel
 * @param niche Optional niche to filter by
 * @param limit Number of channels to return
 * @returns Array of related channel objects
 */
export const fetchRelatedChannels = async (currentChannelId: string, niche?: string, limit: number = 9) => {
  console.log(`Fetching related channels for ID: ${currentChannelId}, niche: ${niche || 'any'}`);
  
  try {
    // Create a base query that excludes the current channel
    let query = supabase
      .from("youtube_channels")
      .select("*")
      .neq("id", currentChannelId)
      .order("created_at", { ascending: false });
    
    // If niche is provided, first try to fetch channels with the same niche
    if (niche) {
      const { data: nicheData, error: nicheError } = await query
        .eq("niche", niche)
        .limit(limit);
      
      if (nicheError) {
        console.error("Error fetching niche-specific channels:", nicheError);
      } else if (nicheData && nicheData.length >= limit) {
        // If we have enough channels from the same niche, return them
        return nicheData as Channel[];
      }
      
      // If we don't have enough channels with the specified niche,
      // we'll fall back to random channels below
    }
    
    // Fetch random channels (either as fallback or primary if no niche specified)
    const { data: randomData, error: randomError } = await supabase
      .from("youtube_channels")
      .select("*")
      .neq("id", currentChannelId)
      .limit(50); // Fetch more than we need so we can randomize
    
    if (randomError) {
      console.error("Error fetching random channels:", randomError);
      throw randomError;
    }
    
    if (!randomData || randomData.length === 0) {
      return [];
    }
    
    // Shuffle and take up to 'limit' channels
    const shuffled = [...randomData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit) as Channel[];
  } catch (error) {
    console.error("Error fetching related channels:", error);
    return [];
  }
};
