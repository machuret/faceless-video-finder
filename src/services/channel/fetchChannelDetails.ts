
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/youtube";

/**
 * Fetches a channel's details from Supabase with optimized field selection
 * @param id Channel ID
 * @returns Channel data and video stats
 */
export const fetchChannelDetails = async (id: string) => {
  console.log(`Fetching channel details for ID: ${id}`);
  
  try {
    // Try edge function first as it's more reliable with RLS issues
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-channel-by-id', {
      body: { 
        channelId: id,
        // We're fetching a specific channel, so no need to limit fields
        // as we'll need the complete data for the details page
      }
    });
    
    if (edgeError) {
      console.error("Edge function error:", edgeError.message);
      // Fall back to direct query if edge function fails
    } else if (edgeData?.channel) {
      console.log("Successfully fetched channel using edge function");
      
      return {
        channel: edgeData.channel as Channel,
        videoStats: edgeData.videoStats || []
      };
    }
    
    // Try direct query as fallback with retry mechanism
    const fetchWithRetry = async (attempts = 3) => {
      try {
        // Define the basic fields to select for the channel
        const { data: channelData, error: channelError } = await supabase
          .from("youtube_channels")
          .select("*") // For full channel details, we need all fields
          .eq("id", id)
          .maybeSingle(); // Using maybeSingle() instead of single() to avoid errors if no records
          
        if (channelError) throw channelError;
        if (!channelData) throw new Error("Channel not found");
        
        // For video stats, select only necessary fields
        const videoStatsFields = 'id, video_id, title, thumbnail_url, views, likes, channel_id';
        
        // Fetch video stats for this channel
        const { data: videoData, error: videoError } = await supabase
          .from("youtube_video_stats")
          .select(videoStatsFields)
          .eq("channel_id", id);
          
        if (videoError) throw videoError;
        
        return {
          channel: channelData as unknown as Channel,
          videoStats: videoData || []
        };
      } catch (error) {
        if (attempts > 1) {
          console.log(`Retrying channel details fetch. Attempts remaining: ${attempts - 1}`);
          await new Promise(r => setTimeout(r, 800)); // Wait 800ms before retrying
          return fetchWithRetry(attempts - 1);
        }
        throw error;
      }
    };
    
    return await fetchWithRetry();
  } catch (error) {
    console.error("Error in fetchChannelDetails:", error);
    throw error;
  }
};
