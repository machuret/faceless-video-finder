
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/youtube";

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
    // First try using our fixed edge function
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-related-channels', {
      body: {
        channelId: currentChannelId,
        niche: niche || null,
        limit: limit
      }
    });
    
    if (edgeError) {
      console.warn("Edge function error:", edgeError.message);
      // Continue to fallback
    } else if (Array.isArray(edgeData) && edgeData.length > 0) {
      console.log(`Successfully fetched ${edgeData.length} related channels via edge function`);
      return edgeData as Channel[];
    }
    
    // If edge function failed, try direct query with careful error handling
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
