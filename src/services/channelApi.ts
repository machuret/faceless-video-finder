
import { supabase } from "@/integrations/supabase/client";
import { Channel, TopVideo } from "@/pages/ChannelDetails/hooks/types";

/**
 * Fetches a channel's details from Supabase
 * @param id Channel ID
 * @returns Channel data and video stats
 */
export const fetchChannelDetails = async (id: string) => {
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

  return {
    channel: channelData as unknown as Channel,
    videoStats: videoData || []
  };
};

/**
 * Fetches top performing videos for a YouTube channel
 * @param youtubeChannelId YouTube channel ID
 * @returns Most viewed and most engaging videos
 */
export const fetchTopPerformingVideos = async (youtubeChannelId: string) => {
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

  return {
    mostViewedVideo: data.mostViewed as TopVideo || null,
    mostEngagingVideo: data.mostEngaging as TopVideo || null
  };
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
    let query = supabase
      .from("youtube_channels")
      .select("*")
      .neq("id", currentChannelId)
      .order("created_at", { ascending: false })
      .limit(50); // Fetch more than we need so we can randomize
    
    // If niche is provided, filter by the same niche first
    if (niche) {
      query = query.eq("niche", niche);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Shuffle and take first 'limit' number
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      const relatedChannels = shuffled.slice(0, limit);
      return relatedChannels as Channel[];
    }
    
    // If we don't have enough channels with the same niche (or no niche was specified),
    // fetch random channels as fallback
    if (!data || data.length < limit) {
      const { data: randomData, error: randomError } = await supabase
        .from("youtube_channels")
        .select("*")
        .neq("id", currentChannelId)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (randomError) throw randomError;
      
      if (randomData && randomData.length > 0) {
        // Shuffle and take remaining needed
        const shuffled = [...randomData].sort(() => 0.5 - Math.random());
        const remainingNeeded = limit - (data?.length || 0);
        const additionalChannels = shuffled.slice(0, remainingNeeded);
        
        // Combine with any niche-specific channels we already have
        const combined = [...(data || []), ...additionalChannels];
        return combined.slice(0, limit) as Channel[];
      }
    }
    
    return data as Channel[] || [];
  } catch (error) {
    console.error("Error fetching related channels:", error);
    throw error;
  }
};
