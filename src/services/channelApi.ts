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
    // Try to fetch using RPC to avoid permission issues
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_channel_by_id', {
      p_channel_id: id
    });
    
    // If RPC succeeded, use that data
    if (!rpcError && rpcData) {
      console.log("Successfully fetched channel using RPC");
      
      // Try to get video stats separately (it's ok if this fails)
      let videoStats = [];
      try {
        const { data: videoData } = await supabase
          .from("youtube_video_stats")
          .select("*")
          .eq("channel_id", id);
          
        if (videoData) videoStats = videoData;
      } catch (videoErr) {
        console.warn("Could not fetch video stats:", videoErr);
      }
      
      return {
        channel: rpcData as unknown as Channel,
        videoStats: videoStats
      };
    }
    
    // Otherwise fall back to normal query
    console.log("RPC failed or not available, falling back to direct query");
    
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
    // Try both direct and edge function approaches
    const [functionsResponse, directResponse] = await Promise.allSettled([
      // Method 1: Edge function
      supabase.functions.invoke('fetch-top-videos', {
        body: { channelId: youtubeChannelId }
      }),
      
      // Method 2: Direct API call to YouTube (if possible via client)
      fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${youtubeChannelId}&order=viewCount&maxResults=10`)
        .then(res => res.json())
        .catch(() => null)
    ]);
    
    // Check edge function result
    if (functionsResponse.status === 'fulfilled' && functionsResponse.value) {
      const { data, error } = functionsResponse.value;
      
      if (!error && data?.mostViewed) {
        return {
          mostViewedVideo: data?.mostViewed as TopVideo || null,
          mostEngagingVideo: data?.mostEngaging as TopVideo || null
        };
      }
    }
    
    // Check direct API result as fallback
    if (directResponse.status === 'fulfilled' && directResponse.value?.items?.length > 0) {
      const items = directResponse.value.items;
      const mostViewed = items[0];
      
      return {
        mostViewedVideo: {
          id: mostViewed.id.videoId,
          title: mostViewed.snippet.title,
          thumbnail: mostViewed.snippet.thumbnails?.high?.url || '',
          views: "Unknown",
          likes: "Unknown",
          comments: "Unknown"
        } as TopVideo,
        mostEngagingVideo: null
      };
    }
    
    // If both failed, return empty result
    console.error("Both methods failed to fetch top videos");
    return { mostViewedVideo: null, mostEngagingVideo: null };
  } catch (error) {
    console.error("Error in fetchTopPerformingVideos:", error);
    return {
      mostViewedVideo: null,
      mostEngagingVideo: null
    };
  }
};

/**
 * Fetches related channels based on niche or similarity with fallback strategies
 * @param currentChannelId ID of the current channel
 * @param niche Optional niche to filter by
 * @param limit Number of channels to return
 * @returns Array of related channel objects
 */
export const fetchRelatedChannels = async (currentChannelId: string, niche?: string, limit: number = 9) => {
  console.log(`Fetching related channels for ID: ${currentChannelId}, niche: ${niche || 'any'}`);
  
  try {
    // First try an RPC call which might bypass RLS issues
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_related_channels', {
        p_channel_id: currentChannelId,
        p_niche: niche || null,
        p_limit: limit
      });
      
      if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        console.log(`Successfully fetched ${rpcData.length} related channels via RPC`);
        return rpcData as Channel[];
      }
    } catch (rpcErr) {
      console.warn("RPC for related channels failed:", rpcErr);
      // Continue to fallback
    }
    
    // If RPC failed, try direct query with careful error handling
    // First, if we have a niche, try that specifically
    if (niche) {
      try {
        const { data: nicheData, error: nicheError } = await supabase
          .from("youtube_channels")
          .select("id, channel_title, description, total_subscribers, total_views, screenshot_url, niche")
          .eq("niche", niche)
          .neq("id", currentChannelId)
          .order("created_at", { ascending: false })
          .limit(limit);
        
        if (!nicheError && nicheData && nicheData.length > 0) {
          console.log(`Found ${nicheData.length} channels in the same niche "${niche}"`);
          
          // Shuffle to randomize results
          return [...nicheData]
            .sort(() => 0.5 - Math.random())
            .slice(0, limit) as Channel[];
        }
      } catch (nicheErr) {
        console.warn("Niche-specific query failed:", nicheErr);
        // Continue to fallback
      }
    }
    
    // Last attempt: just get random channels (avoid any complex filtering)
    try {
      const { data: randomData, error: randomError } = await supabase
        .from("youtube_channels")
        .select("id, channel_title, description, total_subscribers, total_views, screenshot_url, niche")
        .neq("id", currentChannelId)
        .order("created_at", { ascending: false })
        .limit(limit * 2);
        
      if (!randomError && randomData && randomData.length > 0) {
        console.log(`Found ${randomData.length} random channels as fallback`);
        
        // Shuffle and take only needed amount
        return [...randomData]
          .sort(() => 0.5 - Math.random())
          .slice(0, limit) as Channel[];
      }
    } catch (randomErr) {
      console.error("Random channel query failed:", randomErr);
    }
    
    // If we got here, all methods failed
    console.log("All methods to fetch related channels failed, returning empty array");
    return [];
  } catch (error) {
    console.error("Error in fetchRelatedChannels:", error);
    return []; // Return empty array on error
  }
};
