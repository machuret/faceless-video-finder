
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
    let nicheChannels: Channel[] = [];
    
    // If niche is provided, try to fetch channels with the same niche first
    if (niche) {
      const { data: nicheData, error: nicheError } = await supabase
        .from("youtube_channels")
        .select("*")
        .neq("id", currentChannelId)
        .eq("niche", niche)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (nicheError) {
        console.error("Error fetching niche-specific channels:", nicheError);
      } else if (nicheData && nicheData.length > 0) {
        nicheChannels = nicheData as Channel[];
        
        // If we have enough channels from the same niche, return them
        if (nicheChannels.length >= limit) {
          return nicheChannels;
        }
      }
    }
    
    // We need more channels or no niche was specified
    // Get random channels to fill or as a complete set
    const remainingLimit = limit - nicheChannels.length;
    
    const { data: randomData, error: randomError } = await supabase
      .from("youtube_channels")
      .select("*")
      .neq("id", currentChannelId)
      .not("id", "in", `(${nicheChannels.map(c => `'${c.id}'`).join(',')})`)
      .order("created_at", { ascending: false })
      .limit(remainingLimit > 0 ? remainingLimit * 2 : limit * 2); // Get more than needed for randomization
    
    if (randomError) {
      console.error("Error fetching random channels:", randomError);
      // Still return any niche channels we might have found
      return nicheChannels;
    }
    
    if (!randomData || randomData.length === 0) {
      return nicheChannels; // Return just the niche channels or empty array
    }
    
    // Shuffle and take the needed amount
    const shuffled = [...randomData].sort(() => 0.5 - Math.random());
    const randomChannels = shuffled.slice(0, remainingLimit > 0 ? remainingLimit : limit) as Channel[];
    
    // Combine niche-specific and random channels
    return [...nicheChannels, ...randomChannels];
  } catch (error) {
    console.error("Error in fetchRelatedChannels:", error);
    return []; // Return empty array on error
  }
};
